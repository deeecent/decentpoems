import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { HyperPoem, HyperPoem__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { readFileSync, readSync } from "fs";
import { BigNumber, wordlists } from "ethers";

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
      const bytesPerChunk = 6334;
      let lastIndex = 0;

      while (lastIndex < words.length) {
        let bytes = 0;
        let end = lastIndex;
        while (
          end < words.length &&
          bytes + words[end].length < bytesPerChunk
        ) {
          bytes += words[end].length;
          end++;
        }
        const chunk = words.slice(lastIndex, end);
        await hyperPoem.addWords(chunk, lastIndex);
        lastIndex = end;
      }

      /*
      let chunks = 28;
      let index = 0;
      for (let i = 0; i < chunks; i++) {
        await hyperPoem.addWords(
          words.slice(
            (i * words.length) / chunks,
            (i * words.length) / chunks + words.length / chunks
          ),
          index
        );
        index = index + words.length / chunks;
      }
      */
    });

    it("Adds english dictionary words, optimized", async () => {
      const words = readFileSync("popular.txt", "utf-8").split("\n");

      const wordsInt = words
        .map((x) => ethers.utils.solidityPack(["string"], [x]))
        .map((x) => ethers.utils.solidityPack(["uint256"], [x]));

      const bytesPerChunk = 42000;
      let lastIndex = 0;

      while (lastIndex < wordsInt.length) {
        let bytes = 0;
        let end = lastIndex;
        while (bytes + 32 < bytesPerChunk && end < wordsInt.length) {
          bytes += 32;
          end++;
        }
        const chunk = wordsInt.slice(lastIndex, end);
        await hyperPoem.addOpt(chunk, lastIndex);
        lastIndex = end;
      }

      /*
      let chunks = 17;
      let index = 0;
      for (let i = 0; i < chunks; i++) {
        await hyperPoem.addOpt(
          wordsInt.slice(
            (i * words.length) / chunks,
            (i * words.length) / chunks + words.length / chunks
          ),
          index
        );
        index = index + words.length / chunks;
      }
      console.log(await hyperPoem.getWord(42));
      expect(true).eq(true);
      */
    });
  });
});
