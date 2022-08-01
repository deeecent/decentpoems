import { derived, writable, type Readable } from "svelte/store";
import { chainId, networkError, providerReadOnly, signer } from "./wallet";
import { DecentPoems__factory, type DecentPoems } from "../../../typechain";
import { contractsAddresses } from "./config";
import type { BigNumber } from "ethers";
import type { Metadata, Poem } from "src/types";
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
  };

  if (poemStruct.createdAt.gt(0)) {
    poem.created = new Date(poemStruct.createdAt.toNumber() * 1000);
  }

  return poem;
}

export const currentPoem = derived(
  [decentPoemsReadOnly, eventDispatcher],
  ([$decentPoemsReadOnly, $eventDispatcher], set: (value: Poem) => void) => {
    if ($decentPoemsReadOnly && $eventDispatcher) {
      $eventDispatcher.add("VerseSubmitted", () =>
        $decentPoemsReadOnly.getCurrentPoem().then(parsePoemStruct).then(set)
      );
    }
    return () => {
      if ($eventDispatcher) {
        $eventDispatcher.remove("VerseSubmitted");
      }
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
  ([$decentPoemsReadOnly, $eventDispatcher], set: (value: Poem[]) => void) => {
    if ($decentPoemsReadOnly && $eventDispatcher) {
      $eventDispatcher.add("PoemCreated", async () => {
        const [ids, auctions] = await $decentPoemsReadOnly.getAuctions();
        let poems: Poem[] = [];
        for (let i = 0; i < auctions.length; i++) {
          let poem = parsePoemStruct(auctions[i]);
          poem.id = ids[i].toNumber();
          const raw = unpackString(await $decentPoemsReadOnly.poemURI(poem.id));
          poem.metadata = raw.json;
          poems.push(poem);
        }
        console.log(poems);
        set(poems);
      });
    }
    return () => {
      if ($eventDispatcher) {
        $eventDispatcher.remove("PoemCreated");
      }
    };
  }
);
