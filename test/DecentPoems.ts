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

    it("should concatenate prefix, word and postfix", async () => {
      mockDecentWords.words.returns("2");
      await decentPoems.submitVerse("1", 0, "3");

      const result = await decentPoems.getPoem(0);

      expect(result.verses[0]).equal("123");
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

    it("should add a verse to the position 0 if no one submitted to a new poem", async () => {
      for (let i = 0; i < 7; i++) {
        await decentPoems.submitVerse("test", 0, "test");
      }

      await decentPoems.submitVerse("test", 0, "test");

      const result = await decentPoems.getPoem(1);

      expect(result.verses[0]).equal("testtesttest");
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

    it("should add up to 7 verses to the same poem", async () => {
      for (let i = 0; i < 7; i++) {
        await decentPoems.submitVerse("", 0, "");
      }

      const lengthBefore = (await decentPoems.getPoem(0)).verses.length;

      await decentPoems.submitVerse("", 0, "");
      const lengthAfter = (await decentPoems.getPoem(0)).verses.length;

      expect(lengthBefore).eql(lengthAfter);
    });

    it("should change seed after each submission", async () => {
      const seedBefore = await decentPoems._currentRandomSeed();
      await decentPoems.submitVerse("", 0, "");

      const seedAfter = await decentPoems._currentRandomSeed();

      expect(seedBefore).not.equal(seedAfter);
    });

    it("should fail if word index does not match", async () => {
      const currentWordIndex = (await decentPoems.getCurrentWord())[0];

      await expect(
        decentPoems.submitVerse("", currentWordIndex.add(1), "")
      ).revertedWith("Wrong word");
    });

    it("should set createdAt once the 7th verse is submitted", async () => {
      const createdAtBefore = (await decentPoems.getPoem(0)).createdAt;

      for (let i = 0; i < 7; i++) {
        await decentPoems.submitVerse("", 0, "");
      }

      const createdAtAfter = (await decentPoems.getPoem(0)).createdAt;

      expect(createdAtAfter.toNumber()).greaterThan(createdAtBefore.toNumber());
    });
  });

  describe("getCurrentPoem", async () => {
    beforeEach(async () => {
      mockDecentWords.total.returns(1);
      mockDecentWords.words.returns("test");
    });

    it("should get empty if no one submitted", async () => {
      const result = await decentPoems.getCurrentPoem();

      expect(result.verses.length).equal(0);
    });

    it("should get current poem if less than 7 people submitted", async () => {
      for (let i = 0; i < 6; i++) {
        await decentPoems.submitVerse("", 0, "");
      }

      const result = await decentPoems.getCurrentPoem();

      expect(result.verses.length).equal(6);
    });

    it("should get empty poem if 7 people submitted", async () => {
      for (let i = 0; i < 7; i++) {
        await decentPoems.submitVerse("", 0, "");
      }

      const result = await decentPoems.getCurrentPoem();

      expect(result.verses.length).equal(0);
    });
  });
});
