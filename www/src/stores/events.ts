import type { Contract, providers } from "ethers";

const MAX_BLOCK_DELTA = 128;

//let timerId = -1;

export class EventDispatcher {
  contract: Contract;
  address: string;
  provider: providers.Provider;
  topics: string[];
  callbacks: { [key: string]: () => void };
  topicToCallback: { [key: string]: () => void };
  timerId = -1;

  constructor(contract: Contract, provider: providers.Provider) {
    this.contract = contract;
    this.address = contract.address;
    this.provider = provider;
    this.topics = [];
    this.callbacks = {};
    this.topicToCallback = {};
  }

  updateTopics() {
    this.topics = Object.keys(this.callbacks).reduce((prev, curr) => {
      const t = this.contract.filters[curr]().topics;
      if (t && t[0] && !Array.isArray(t[0])) {
        this.topicToCallback[t[0]] = this.callbacks[curr];
        return prev.concat(t[0]);
      } else {
        throw new Error(
          `"${curr}" doesn't exist in contract or multiple topics provided`
        );
      }
    }, [] as string[]);
  }

  add(eventName: string, callback: () => void) {
    this.callbacks[eventName] = callback;
    this.updateTopics();
    if (this.timerId > 0) {
      callback();
    } else {
      this.listen();
    }
  }

  remove(eventName: string) {
    delete this.callbacks[eventName];
    this.updateTopics();
    if (!Object.keys(this.callbacks).length) {
      this.stop();
    }
  }

  async listen() {
    if (this.timerId > 0) {
      return;
    }
    this.timerId = 99999;

    // This can fail and block everything
    let lastBlock = (await this.provider.getBlock("latest")).number;

    // Trigger all callbacks
    Object.values(this.callbacks).forEach((callback) => callback());

    this.timerId = window.setInterval(async () => {
      const currentBlock = (await this.provider.getBlock("latest")).number;
      const delta = currentBlock - lastBlock;
      console.log("Check events", lastBlock, currentBlock, delta);

      if (delta < 0) {
        return;
      }

      if (delta < MAX_BLOCK_DELTA) {
        // See https://ethereum.stackexchange.com/a/109378/33448 and comment section
        let events = await this.contract.queryFilter(
          {
            address: this.address,
            topics: [this.topics],
          },
          lastBlock,
          currentBlock
        );

        for (let event of events) {
          if (event.topics) {
            console.log("Trigger", event);
            const callback = this.topicToCallback[event.topics[0]];
            if (callback) {
              callback();
            }
          }
        }
      } else {
        Object.values(this.callbacks).forEach((callback) => callback);
      }
      lastBlock = currentBlock + 1;
    }, 5000);
  }

  stop() {
    window.clearInterval(this.timerId);
    this.timerId = -1;
  }
}
