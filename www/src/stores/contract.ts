import { derived, type Readable } from "svelte/store";
import { chainId, networkError, providerReadOnly, signer } from "./wallet";
import { DecentPoems__factory, type DecentPoems } from "../../../typechain";
import { contractsAddresses } from "./config";
import type { BigNumber, ethers } from "ethers";
import type { Poem } from "src/types";

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

export const decentPoemsReadOnly: Readable<DecentPoems | null> = derived(
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

let timerId = -1;

function parsePoemStruct(poemStruct: DecentPoems.PoemStructOutput) {
  return {
    title: {
      text: poemStruct.verses[0],
      author: poemStruct.authors[0],
    },
    verses: poemStruct.verses.slice(1).reduce((prev, curr, index) => {
      prev.push({
        text: poemStruct.verses[index + 1],
        author: poemStruct.authors[index + 1],
      });
      return prev;
    }, [] as { author: string; text: string }[]),
    created: new Date(poemStruct.createdAt.toNumber() * 1000),
  } as Poem;
}

async function updatePoem(
  contract: DecentPoems,
  provider: ethers.providers.JsonRpcProvider,
  set: (value: Poem) => void
) {
  if (timerId !== -1) {
    console.log("updatePoems: clear interval", timerId);
    window.clearInterval(timerId);
  }

  let lastBlock = (await provider.getBlock("latest")).number;
  set(parsePoemStruct(await contract.getCurrentPoem()));

  timerId = window.setInterval(async () => {
    const currentBlock = (await provider.getBlock("latest")).number;
    let eventsFilter = contract.filters.VerseSubmitted();
    let events = await contract.queryFilter(
      eventsFilter,
      lastBlock,
      currentBlock
    );
    console.log("Check current Poem events", lastBlock, currentBlock, events);
    if (events.length) {
      set(parsePoemStruct(await contract.getCurrentPoem()));
    }
    lastBlock = currentBlock;
  }, 10000);
}

export const currentPoem = derived(
  [providerReadOnly, decentPoemsReadOnly],
  ([$providerReadOnly, $decentPoemsReadOnly], set: (value: Poem) => void) => {
    if ($decentPoemsReadOnly && $providerReadOnly) {
      updatePoem($decentPoemsReadOnly, $providerReadOnly, set);
    }
    () => {
      console.log("currentPoem: clear interval", timerId);
      clearInterval(timerId);
    };
  }
);

export const currentWord = derived(
  [decentPoemsReadOnly, currentPoem],
  (
    [$decentPoemsReadOnly, $currentPoem],
    set: ({ index, word }: { index: BigNumber; word: string }) => void
  ) => {
    if ($decentPoemsReadOnly && $currentPoem) {
      $decentPoemsReadOnly
        .getCurrentWord()
        .then(({ index, word }) => set({ index, word }));
    }
  }
);
