import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { DecentWords, DecentWords__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { readFileSync, readSync } from "fs";
import { BigNumber, wordlists } from "ethers";
import { getEVMTimestamp, mineEVMBlock } from "./evm";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

const AddressZero = ethers.constants.AddressZero;
const AddressOne = AddressZero.replace(/.$/, "1");

describe("DecentWords", () => {
  let decentWords: DecentWords;
  let alice: SignerWithAddress, bob: SignerWithAddress;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();

    const DecentWordsFactory = (await ethers.getContractFactory(
      "DecentWords",
      alice
    )) as DecentWords__factory;
    decentWords = await DecentWordsFactory.deploy();
    await decentWords.deployed();
  });

  describe("addWords", async () => {
    it("should append a new word", async () => {
      await decentWords.addWords(["test"]);

      const result = await decentWords.words(0);
      expect(result).equal("test");
    });

    it("should append multiple new words", async () => {
      await decentWords.addWords(["test", "test2"]);

      let result = await decentWords.words(1);
      expect(result).equal("test2");
    });

    it("should append multiple new words multiple times", async () => {
      await decentWords.addWords(["test", "test2"]);
      await decentWords.addWords(["test3", "test4"]);

      let result = [await decentWords.words(2), await decentWords.words(3)];
      expect(result).eql(["test3", "test4"]);
    });

    it("should update total", async () => {
      await decentWords.addWords(["test", "test2"]);

      let result = await decentWords.total();
      expect(result).equal(2);
    });
  });
});
