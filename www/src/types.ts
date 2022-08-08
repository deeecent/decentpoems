import type { BigNumber } from "ethers";

export type Metadata = {
  name: string;
  description: string;
  image: string;
};

export type Poem = {
  title: {
    author: string;
    text: string;
    word: string;
  };
  verses: {
    author: string;
    text: string;
    word: string;
  }[];
  created: Date;
  validUntil: Date;
  split: string;
};

export type PoemAuction = Poem & {
  id: number;
  metadata: Metadata;
  price: BigNumber;
};
