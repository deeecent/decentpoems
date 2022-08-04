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
  };
  verses: {
    author: string;
    text: string;
  }[];
  created: Date;
  validUntil: Date;
};

export type PoemAuction = Poem & {
  id: number;
  metadata: Metadata;
  price: BigNumber;
};
