import { derived, writable, type Readable } from "svelte/store";
import {
  networkError,
  providerReadOnly,
  signer,
  signerChainId,
} from "./wallet";
import { DecentPoems__factory, type DecentPoems } from "../../../typechain";
import { contractsAddresses, ethereumChainId } from "./config";
import { BigNumber } from "ethers";
import type { PoemAuction, Metadata, Poem } from "src/types";
import { EventDispatcher } from "./events";
import { Buffer } from "buffer/";
import popular from "../popular.json";
import { RecoverableError, retry } from "./retry";

export const decentPoems: Readable<DecentPoems | null> = derived(
  [networkError, signer, signerChainId],
  ([$networkError, $signer, $signerChainId], set) => {
    if (!$networkError && $signer && $signerChainId === ethereumChainId) {
      console.log("setting decentpoems", $signerChainId);
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

export const auctionDuration = derived(
  decentPoemsReadOnly,
  ($decentPoemsReadOnly, set: (value: number | null) => void) => {
    if ($decentPoemsReadOnly) {
      const update = retry(async () => {
        const duration = await $decentPoemsReadOnly._auctionDuration();
        set(duration.toNumber());
      });
      update();
    } else {
      set(null);
    }
  },
  null
);

const eventDispatcher = derived(
  decentPoemsReadOnly,
  ($decentPoemsReadOnly, set: (value: EventDispatcher | null) => void) => {
    if ($decentPoemsReadOnly) {
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

function parsePoemStruct(
  poemStruct: DecentPoems.PoemStructOutput,
  auctionDuration = 0
) {
  const created = new Date(poemStruct.createdAt.toNumber() * 1000);
  const validUntil = new Date(created.getTime() + auctionDuration * 1000);
  const poem: Poem = {
    title: {
      text: poemStruct.verses[0],
      author: poemStruct.authors[0],
      word: poemStruct.wordIndexes.length
        ? popular[poemStruct.wordIndexes[0].toNumber()]
        : "",
    },
    verses: poemStruct.verses.slice(1).reduce((prev, _, index) => {
      prev.push({
        text: poemStruct.verses[index + 1],
        author: poemStruct.authors[index + 1],
        word: poemStruct.wordIndexes.length
          ? popular[poemStruct.wordIndexes[index + 1].toNumber()]
          : "",
      });
      return prev;
    }, [] as { author: string; text: string; word: string }[]),
    created,
    validUntil,
    split: poemStruct.split,
  };
  return poem;
}

export const currentPoem = derived(
  [decentPoemsReadOnly, eventDispatcher],
  ([$decentPoemsReadOnly, $eventDispatcher], set: (value: Poem) => void) => {
    if ($decentPoemsReadOnly && $eventDispatcher) {
      const update = retry(async () => {
        let current: DecentPoems.PoemStructOutput;
        try {
          current = await $decentPoemsReadOnly.getCurrentPoem();
        } catch (e: unknown) {
          throw new RecoverableError("Error fetching current poem", e);
        }
        const parsed = parsePoemStruct(current);
        set(parsed);
      });

      let index = $eventDispatcher.add("VerseSubmitted", update);

      update();

      return () => {
        $eventDispatcher.remove(index);
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
      const update = retry(async () => {
        try {
          const [index, word] = await $decentPoemsReadOnly.getCurrentWord();
          set({ index: index.toNumber(), word });
        } catch (e: unknown) {
          try {
            const forgiveMeFather: string = (e as any).toString();
            if (forgiveMeFather.indexOf("Word not generated yet") >= 0) {
              return;
            }
          } catch (e) {}
          set({ index: -1, word: "" });
          throw new RecoverableError("Error fetching current word", e);
        }
      });

      const unset = () => set({ index: -1, word: "" });

      const indexVerseSubmitted = $eventDispatcher.add("VerseSubmitted", unset);
      const indexWordGenerated = $eventDispatcher.add("WordGenerated", update);

      update();

      return () => {
        $eventDispatcher.remove(indexVerseSubmitted);
        $eventDispatcher.remove(indexWordGenerated);
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
  [decentPoemsReadOnly, auctionDuration, eventDispatcher],
  (
    [$decentPoemsReadOnly, $auctionDuration, $eventDispatcher],
    set: (value: PoemAuction[]) => void
  ) => {
    if ($decentPoemsReadOnly && $auctionDuration && $eventDispatcher) {
      const update = retry(async () => {
        const [ids, auctionsStruct] = await $decentPoemsReadOnly.getAuctions();
        let poems: PoemAuction[] = [];
        for (let i = 0; i < auctionsStruct.length; i++) {
          const poem = parsePoemStruct(auctionsStruct[i], $auctionDuration);
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
      });

      let poemCreatedIndex = $eventDispatcher.add("PoemCreated", update);
      let transferIndex = $eventDispatcher.add("Transfer", update);

      update();

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
      const update = retry(async () => {
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
      });

      let index = $eventDispatcher.add("Transfer", update);

      update();

      return () => {
        $eventDispatcher.remove(index);
      };
    }
  }
);

export function linkToOpensea(tokenId: number) {
  const address = contractsAddresses["DecentPoems"];
  if (ethereumChainId === 137) {
    return `https://opensea.io/assets/matic/${address}/${tokenId}`;
  }
  return `https://testnets.opensea.io/assets/mumbai/${address}/${tokenId}`;
}

export function linkToSplit(address: string) {
  return `https://app.0xsplits.xyz/accounts/${address}/`;
}

export function linkToContract() {
  const address = contractsAddresses["DecentPoems"];
  if (ethereumChainId === 137) {
    return `https://polygonscan.com/address/${address}`;
  }
  return `https://mumbai.polygonscan.com/address/${address}`;
}
