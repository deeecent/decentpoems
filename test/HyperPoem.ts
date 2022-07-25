import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { HyperPoem, HyperPoem__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { readFileSync, readSync } from "fs";
import { BigNumber } from "ethers";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

const AddressZero = ethers.constants.AddressZero;
const AddressOne = AddressZero.replace(/.$/, "1");

describe("Storage", () => {
  let hyperPoem: HyperPoem;
  let alice: SignerWithAddress, bob: SignerWithAddress;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();

    const HyperPoemFactory = (await ethers.getContractFactory(
      "HyperPoem",
      alice
    )) as HyperPoem__factory;
    hyperPoem = await HyperPoemFactory.deploy();
    await hyperPoem.deployed();
  });

  describe("HyperPoem", async () => {
    it("Adds english dictionary words", async () => {
      const words = readFileSync("popular.txt", "utf-8").split("\n");

      const bytesPerChunk = 6000;
      let chunks: string[][] = [];

      let j = 0;
      while (j < words.length) {
        let bytes = 0;
        let currentChunk = [];
        for (; j < words.length && bytes < bytesPerChunk; j++) {
          currentChunk.push(words[j]);
          bytes += words[j].length;
        }
        console.log(bytes);
        chunks.push(currentChunk);
      }

      await Promise.all(
        chunks.map(async (chunk) => {
          await hyperPoem.addWords(chunk);
          console.log(chunk.length);
        })
      );
      expect(true).eq(true);
    });

    it.only("Adds english dictionary words, optimized", async () => {
      const words = readFileSync("popular.txt", "utf-8").split("\n");

      const wordsInt = words
        .map((x) => ethers.utils.solidityPack(["string"], [x]))
        .map((x) => ethers.utils.solidityPack(["uint256"], [x]));
      await hyperPoem.addOpt(wordsInt.slice(0, wordsInt.length / 25));
      console.log(await hyperPoem.getWord(42));
      expect(true).eq(true);
    });
  });
});
