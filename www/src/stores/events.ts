import type { Contract, providers } from "ethers";

const MAX_BLOCK_DELTA = 128;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class EventDispatcher {
  contract: Contract;
  address: string;
  provider: providers.Provider;
  topics: string[];
  callbacks: [string, () => void][];
  topicToCallbacks: { [key: string]: (() => void)[] };
  timerId = -1;

  constructor(contract: Contract, provider: providers.Provider) {
    this.contract = contract;
    this.address = contract.address;
    this.provider = provider;
    this.topics = [];
    this.callbacks = [];
    this.topicToCallbacks = {};
  }

  updateTopics() {
    this.topics = [];
    this.topicToCallbacks = {};
    for (let [eventName, callback] of this.callbacks) {
      const t = this.contract.filters[eventName]().topics;
      if (t && t[0] && !Array.isArray(t[0])) {
        const first = t[0];
        if (!this.topicToCallbacks[first]) {
          this.topicToCallbacks[first] = [];
        }
        this.topicToCallbacks[first].push(callback);
        this.topics = this.topics.concat(first);
      } else {
        throw new Error(
          `"${eventName}" doesn't exist in contract or multiple topics provided`
        );
      }
    }
  }

  add(eventName: string, callback: () => void) {
    this.callbacks.push([eventName, callback]);
    //this.callbacks[eventName] = callback;
    this.updateTopics();
    //callback();
    if (this.timerId < 0) {
      this.listen();
    }
    return this.callbacks.length - 1;
  }

  remove(listenerId: number) {
    this.callbacks.splice(listenerId, 1);
    this.updateTopics();
    if (!this.callbacks.length) {
      this.stop();
    }
  }

  async listen() {
    if (this.timerId > 0) {
      return;
    }
    this.timerId = 99999;

    let lastBlock: number = -1;
    while (lastBlock < 0) {
      try {
        lastBlock = (await this.provider.getBlock("latest")).number;
      } catch (e) {
        console.error(e);
        await sleep(1000);
      }
    }

    // Trigger all callbacks
    this.callbacks.forEach(([, callback]) => callback());

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
            const callbacks = this.topicToCallbacks[event.topics[0]];
            if (callbacks.length) {
              callbacks.forEach((c) => c());
            }
          }
        }
      } else {
        this.callbacks.forEach(([, callback]) => callback());
      }
      lastBlock = currentBlock + 1;
    }, 5000);
  }

  stop() {
    window.clearInterval(this.timerId);
    this.timerId = -1;
  }
}
