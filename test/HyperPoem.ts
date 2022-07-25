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

      let chunks = 28;
      for (let i = 0; i < chunks; i++) {
        await hyperPoem.addWords(
          words.slice(
            i * words.length,
            i * words.length + words.length / chunks
          )
        );
      }
    });

    it("Adds english dictionary words, optimized", async () => {
      const words = readFileSync("popular.txt", "utf-8").split("\n");

      const wordsInt = words
        .map((x) => ethers.utils.solidityPack(["string"], [x]))
        .map((x) => ethers.utils.solidityPack(["uint256"], [x]));
      let chunks = 25;
      for (let i = 0; i < chunks; i++) {
        await hyperPoem.addOpt(
          wordsInt.slice(
            i * wordsInt.length,
            i * wordsInt.length + wordsInt.length / chunks
          )
        );
      }
      console.log(await hyperPoem.getWord(42));
      expect(true).eq(true);
    });
  });
});
