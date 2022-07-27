import { derived, type Readable, type Writable, writable } from "svelte/store";
import { chainId, networkError, providerReadOnly, signer } from "./wallet";
import { DecentPoems__factory, type DecentPoems } from "../../../typechain";
import { contractsAddresses } from "./config";

export const decentPoems: Readable<DecentPoems | null> = derived(
  [networkError, signer, chainId],
  ([$networkError, $signer, $chainId], set) => {
    if (!$networkError && $signer && $chainId) {
      set(
        DecentPoems__factory.connect(contractsAddresses["DecentPoems"], $signer)
      );
    } else {
      set(null);
    }
  }
);

export const decentsPoemsReadOnly: Readable<DecentPoems | null> = derived(
  providerReadOnly,
  ($providerReadOnly, set) => {
    if ($providerReadOnly) {
      set(
        DecentPoems__factory.connect(
          contractsAddresses["DecentPoems"],
          $providerReadOnly
        )
      );
    } else {
      set(null);
    }
  }
);

export const currentPoem: Writable<DecentPoems.PoemStruct> = writable();

let timerId = -1;

export const updateCurrentPoem = derived(
  [providerReadOnly, decentsPoemsReadOnly],
  ([$providerReadOnly, $decentsPoemsReadOnly]) => {
    if ($decentsPoemsReadOnly && $providerReadOnly) {
      let lastBlock = 0;
      if (timerId !== -1) {
        window.clearInterval(timerId);
      }
      timerId = window.setInterval(async () => {
        const currentBlock = (await $providerReadOnly.getBlock("latest"))
          .number;
        if (lastBlock > 0) {
          let eventsFilter = $decentsPoemsReadOnly.filters.VerseSubmitted();
          let events = await $decentsPoemsReadOnly.queryFilter(
            eventsFilter,
            lastBlock,
            currentBlock
          );
          if (events.length) {
            // reload
          }
          eventsFilter = $decentsPoemsReadOnly.filters.PoemCreated();
          events = await $decentsPoemsReadOnly.queryFilter(
            eventsFilter,
            lastBlock,
            currentBlock
          );
          if (events.length) {
            // reload
          }
        }
        lastBlock = currentBlock;
      }, 1000);
    }
  }
);
