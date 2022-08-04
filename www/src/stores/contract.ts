import { derived, writable, type Readable } from "svelte/store";
import { chainId, networkError, providerReadOnly, signer } from "./wallet";
import { DecentPoems__factory, type DecentPoems } from "../../../typechain";
import { contractsAddresses } from "./config";
import { BigNumber } from "ethers";
import type { PoemAuction, Metadata, Poem } from "src/types";
import { EventDispatcher } from "./events";
import { Buffer } from "buffer/";

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

const eventDispatcher = derived(
  decentPoemsReadOnly,
  ($decentPoemsReadOnly, set: (value: EventDispatcher | null) => void) => {
    if ($decentPoemsReadOnly) {
      console.log("Create dispatcher");
      const d = new EventDispatcher(
        $decentPoemsReadOnly,
        $decentPoemsReadOnly.provider
      );
      set(d);
    } else {
      set(null);
    }
  }
);

function parsePoemStruct(poemStruct: DecentPoems.PoemStructOutput) {
  const created = new Date(poemStruct.createdAt.toNumber() * 1000);
  const validUntil = new Date(created.setDate(created.getDate() + 1));
  const poem: Poem = {
    title: {
      text: poemStruct.verses[0],
      author: poemStruct.authors[0],
    },
    verses: poemStruct.verses.slice(1).reduce((prev, _, index) => {
      prev.push({
        text: poemStruct.verses[index + 1],
        author: poemStruct.authors[index + 1],
      });
      return prev;
    }, [] as { author: string; text: string }[]),
    created,
    validUntil,
  };
  return poem;
}

export const currentPoem = derived(
  [decentPoemsReadOnly, eventDispatcher],
  ([$decentPoemsReadOnly, $eventDispatcher], set: (value: Poem) => void) => {
    if ($decentPoemsReadOnly && $eventDispatcher) {
      let index = $eventDispatcher.add("VerseSubmitted", () =>
        $decentPoemsReadOnly
          .getCurrentPoem()
          .then(parsePoemStruct)
          .then(set)
          .catch((e) => {
            console.log("Error fetching current poem", e);
          })
      );
      return () => {
        if ($eventDispatcher) {
          $eventDispatcher.remove(index);
        }
      };
    }
  }
);

export const currentWord = derived(
  [decentPoemsReadOnly, eventDispatcher],
  (
    [$decentPoemsReadOnly, $eventDispatcher],
    set: (value: { index: number; word: string }) => void
  ) => {
    if ($decentPoemsReadOnly && $eventDispatcher) {
      const update = async () => {
        try {
          const [index, word] = await $decentPoemsReadOnly.getCurrentWord();
          set({ index: index.toNumber(), word: word });
        } catch (e) {
          console.log("Error fetching current word", e);
          set({ index: -1, word: "" });
        }
      };
      const indexVerseSubmitted = $eventDispatcher.add(
        "VerseSubmitted",
        update
      );
      const indexWordGenerated = $eventDispatcher.add("WordGenerated", update);
      return () => {
        if ($eventDispatcher) {
          $eventDispatcher.remove(indexVerseSubmitted);
          $eventDispatcher.remove(indexWordGenerated);
        }
      };
    } else {
      set({ index: -1, word: "" });
    }
  },

  { index: -1, word: "" }
);

export const refreshAuctions = writable(Date.now());

export function unpackString(s: string) {
  function decode(x: string) {
    return Buffer.from(x, "base64").toString("utf8");
  }
  const [jsonHeader, jsonRaw] = s.split(",");
  const json: Metadata = JSON.parse(decode(jsonRaw));
  const [svgHeader, svgRaw] = json.image.split(",");
  const svg = decode(svgRaw);
  return {
    raw: s,
    json,
    jsonHeader,
    jsonRaw,
    svgHeader,
    svgRaw,
    svg,
  };
}

export const auctions = derived(
  [decentPoemsReadOnly, eventDispatcher],
  (
    [$decentPoemsReadOnly, $eventDispatcher],
    set: (value: PoemAuction[]) => void
  ) => {
    if ($decentPoemsReadOnly && $eventDispatcher) {
      const update = async () => {
        const [ids, auctionsStruct] = await $decentPoemsReadOnly.getAuctions();
        let poems: PoemAuction[] = [];
        for (let i = 0; i < auctionsStruct.length; i++) {
          const poem = parsePoemStruct(auctionsStruct[i]);
          const id = ids[i].toNumber();
          const raw = unpackString(await $decentPoemsReadOnly.poemURI(id));
          const price = await $decentPoemsReadOnly.getCurrentPrice(id);
          poems.push({
            ...poem,
            metadata: raw.json,
            id,
            price,
          });
        }
        set(poems);
      };
      let poemCreatedIndex = $eventDispatcher.add("PoemCreated", update);
      let transferIndex = $eventDispatcher.add("Transfer", update);
      return () => {
        $eventDispatcher.remove(poemCreatedIndex);
        $eventDispatcher.remove(transferIndex);
      };
    }
  }
);

export const minted = derived(
  [decentPoemsReadOnly, eventDispatcher],
  (
    [$decentPoemsReadOnly, $eventDispatcher],
    set: (value: PoemAuction[]) => void
  ) => {
    if ($decentPoemsReadOnly && $eventDispatcher) {
      const update = async () => {
        const auctionsStruct = await $decentPoemsReadOnly.getMinted(0);
        let poems: PoemAuction[] = [];
        for (let i = 0; i < auctionsStruct.length; i++) {
          if (auctionsStruct[i].createdAt.eq(0)) {
            break;
          }
          const poem = parsePoemStruct(auctionsStruct[i]);
          // Minting starts with tokenId 1
          const id = i + 1;
          const raw = unpackString(await $decentPoemsReadOnly.tokenURI(id));
          poems.push({
            ...poem,
            metadata: raw.json,
            id,
            price: BigNumber.from(0),
          });
        }
        set(poems);
      };
      let index = $eventDispatcher.add("Transfer", update);
      return () => {
        $eventDispatcher.remove(index);
      };
    }
  }
);
