import { ethers } from "hardhat";
import chai from "chai";
import { smock } from "@defi-wonderland/smock";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import {
  DecentPoems,
  DecentPoems__factory,
  DecentWords__factory,
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

const AddressZero = ethers.constants.AddressZero;

describe("DecentPoems", () => {
  let decentPoems: DecentPoems;
  let mockDecentWords: any;
  let alice: SignerWithAddress, bob: SignerWithAddress;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();

    const mockDecentWordsFactory = await smock.mock<DecentWords__factory>(
      "DecentWords"
    );
    mockDecentWords = await mockDecentWordsFactory.deploy();

    const DecentPoemsFactory = (await ethers.getContractFactory(
      "DecentPoems",
      alice
    )) as DecentPoems__factory;
    decentPoems = await DecentPoemsFactory.deploy(mockDecentWords.address, 7);
    await decentPoems.deployed();
  });

  describe("getCurentWord", async () => {
    it("should get a word from the decent words", async () => {
      mockDecentWords.total.returns(1);
      mockDecentWords.words.returns("test");

      const result = await decentPoems.getCurrentWord();

      expect(result).eql([BigNumber.from(0), "test"]);
    });

    it("should fail if decent words is empty", async () => {
      mockDecentWords.total.returns(0);

      await expect(decentPoems.getCurrentWord()).revertedWith(
        "DecentWords not populated"
      );
    });
  });

  describe("submitVerse", async () => {
    beforeEach(async () => {
      mockDecentWords.total.returns(1);
      mockDecentWords.words.returns("test");
    });

    it("should add a verse to the position 0 no one submitted", async () => {
      await decentPoems.submitVerse("test", 0, "test");

      const result = await decentPoems.getPoem(0);

      expect(result.verses[0]).equal("testtesttest");
    });

    it("should add a verse to the next position if someone already submitted", async () => {
      await decentPoems.submitVerse("test", 0, "test");
      await decentPoems.submitVerse("test2", 0, "test2");

      const result = await decentPoems.getPoem(0);

      expect(result.verses[1]).equal("test2testtest2");
    });

    it("should add a verse to a new poem if 7 people already submitted", async () => {
      for (let i = 0; i < 7; i++) {
        await decentPoems.submitVerse("test", 0, "test");
      }

      await decentPoems.submitVerse("test2", 0, "test2");

      const result = await decentPoems.getPoem(1);

      expect(result.verses[0]).equal("test2testtest2");
    });

    it("should add all authors to a poem", async () => {
      const authors = [bob, alice, bob, alice, alice, bob, bob];
      for (let i = 0; i < 7; i++) {
        await decentPoems.connect(authors[i]).submitVerse("", 0, "");
      }

      const result = await decentPoems.getPoem(0);

      expect(result.authors).eql(authors.map((a) => a.address));
    });

    it("should add all verses to a poem", async () => {
      const verses = ["1", "2", "3", "4", "5", "6", "7"];
      for (let i = 0; i < 7; i++) {
        await decentPoems.submitVerse(verses[i], 0, "");
      }

      const result = await decentPoems.getPoem(0);

      expect(result.verses).eql(verses.map((v) => v + "test"));
    });

    it("should add all word indices to a poem", async () => {
      const fakeWords = ["1", "2", "3", "4", "5", "6", "7"];
      mockDecentWords.total.returns(3);
      mockDecentWords.words.whenCalledWith(0).returns("1");
      mockDecentWords.words.whenCalledWith(1).returns("2");
      mockDecentWords.words.whenCalledWith(2).returns("3");

      let indices = [];
      for (let i = 0; i < 7; i++) {
        const currentIndex = (await decentPoems.getCurrentWord())[0];
        indices.push(currentIndex);
        await decentPoems.submitVerse("", currentIndex, "");
      }

      const result = await decentPoems.getPoem(0);

      expect(result.wordIndexes).eql(indices);
    });
  });
});
