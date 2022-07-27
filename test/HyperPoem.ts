import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { DecentPoems, DecentPoems__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { readFileSync, readSync } from "fs";
import { BigNumber, wordlists } from "ethers";
import { getEVMTimestamp, mineEVMBlock } from "./evm";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

const AddressZero = ethers.constants.AddressZero;
const AddressOne = AddressZero.replace(/.$/, "1");

describe("Storage", () => {
  let decentPoems: DecentPoems;
  let alice: SignerWithAddress, bob: SignerWithAddress;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();

    const DecentPoemsFactory = (await ethers.getContractFactory(
      "DecentPoems",
      alice
    )) as DecentPoems__factory;
    decentPoems = await DecentPoemsFactory.deploy(2);
    await decentPoems.deployed();
  });

  describe("DecentPoems", async () => {
    beforeEach(async () => {
      await decentPoems.addWords(["foo", "bar", "baz"], 0);
    });

    it("returns the current auctions", async () => {
      let [id] = await decentPoems.getCurrentWord();

      await decentPoems.submitVerse("prefix ", id, " suffix");
      [id] = await decentPoems.getCurrentWord();
      await decentPoems.submitVerse("prefix ", id, " suffix");
      console.log(await decentPoems.getAuctions());
    });
  });

  describe.skip("DecentWords", async () => {
    it.skip("Adds english dictionary words", async () => {
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
        await decentPoems.addWords(chunk, lastIndex);
        lastIndex = end;
      }
    });
  });
});
