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
import { getEVMTimestamp, setEVMTimestamp, mineEVMBlock } from "./evm";

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

    mockDecentWords.total.returns(1);
    mockDecentWords.words.returns("test");
  });

  async function producePoem() {
    for (let i = 0; i < 7; i++) {
      await decentPoems.submitVerse("", 0, "");
    }
  }

  describe("getCurentWord", async () => {
    it("should get a word from the decent words", async () => {
      mockDecentWords.words.returns("aword");

      const result = await decentPoems.getCurrentWord();

      expect(result).eql([BigNumber.from(0), "aword"]);
    });

    it("should fail if decent words is empty", async () => {
      mockDecentWords.total.returns(0);

      await expect(decentPoems.getCurrentWord()).revertedWith(
        "DecentWords not populated"
      );
    });
  });

  describe("submitVerse", async () => {
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

      await producePoem();

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
      await producePoem();

      const result = await decentPoems.getCurrentPoem();

      expect(result.verses.length).equal(0);
    });
  });

  describe("getCurrentPrice", async () => {
    it("should fail if poem does not exist", async () => {
      await expect(decentPoems.getCurrentPrice(1)).revertedWith("Invalid poem");
    });

    it("should fail if poem is still being created", async () => {
      await expect(decentPoems.getCurrentPrice(0)).revertedWith("Invalid poem");
    });

    it("should fail if poem is already minted", async () => {
      await producePoem();
      const price = await decentPoems._auctionStartPrice();
      await decentPoems.safeMint(alice.address, 0, { value: price });

      await expect(decentPoems.getCurrentPrice(0)).revertedWith(
        "Poem already minted"
      );
    });

    it("should fail if poem is expired", async () => {
      await producePoem();
      const auctionDuration = await decentPoems._auctionDuration();
      const currentTimestamp = await getEVMTimestamp();
      await setEVMTimestamp(currentTimestamp + auctionDuration.toNumber() + 1);
      await mineEVMBlock();

      await expect(decentPoems.getCurrentPrice(0)).revertedWith(
        "Auction expired"
      );
    });

    it("should return maximum price right after poem is created", async () => {
      await producePoem();
      const maxPrice = await decentPoems._auctionStartPrice();

      expect(await decentPoems.getCurrentPrice(0)).equal(maxPrice);
    });

    it("should return minimum price right before auction expires", async () => {
      await producePoem();
      const minimumPrice = await decentPoems._auctionEndPrice();

      const createTimestamp = (await decentPoems.getPoem(0)).createdAt;
      const auctionDuration = await decentPoems._auctionDuration();
      await setEVMTimestamp(
        createTimestamp.toNumber() + auctionDuration.toNumber()
      );
      await mineEVMBlock();

      expect(await decentPoems.getCurrentPrice(0)).equal(minimumPrice);
    });

    it("should return half the price half-way through the auction", async () => {
      await producePoem();
      const minimumPrice = await decentPoems._auctionEndPrice();
      const maxPrice = await decentPoems._auctionStartPrice();
      const halfPrice = maxPrice.sub(maxPrice.sub(minimumPrice).div(2));

      const createTimestamp = (await decentPoems.getPoem(0)).createdAt;
      const auctionDuration = await decentPoems._auctionDuration();
      await setEVMTimestamp(
        createTimestamp.toNumber() + auctionDuration.div(2).toNumber()
      );
      await mineEVMBlock();

      expect(await decentPoems.getCurrentPrice(0)).equal(halfPrice);
    });
  });

  describe("getAuctions", async () => {
    it("should return empty if no poem has been created", async () => {
      const result = await decentPoems.getAuctions();

      expect(result.length).equal(0);
    });

    it("should return all poems created within the auction duration time", async () => {
      await producePoem();
      await producePoem();

      const result = await decentPoems.getAuctions();

      expect(result.length).equal(2);
    });

    it("should not return poems that have been minted", async () => {
      await producePoem();
      const price = await decentPoems._auctionStartPrice();
      await decentPoems.safeMint(alice.address, 0, { value: price });

      const result = await decentPoems.getAuctions();

      expect(result.length).equal(0);
    });

    it("should not return expired poems", async () => {
      await producePoem();
      const auctionDuration = await decentPoems._auctionDuration();
      const currentTimestamp = await getEVMTimestamp();
      await setEVMTimestamp(currentTimestamp + auctionDuration.toNumber() + 1);
      await mineEVMBlock();

      const result = await decentPoems.getAuctions();

      expect(result.length).equal(0);
    });
  });

  describe.only("getMinted", async () => {
    function getExisting(items: any) {
      let existing = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].createdAt.toNumber() > 0) {
          existing.push(items[i]);
        } else {
          break;
        }
      }

      return existing;
    }

    it("should return empty if no poem has been minted", async () => {
      const result = await decentPoems.getMinted(0);

      expect(result[0].createdAt).equal(0);
    });

    it("should return all poems minted until now", async () => {
      await producePoem();
      await producePoem();
      const price = await decentPoems._auctionStartPrice();
      await decentPoems.safeMint(alice.address, 0, { value: price });
      await decentPoems.safeMint(alice.address, 1, { value: price });

      const result = await decentPoems.getMinted(0);

      let existing = getExisting(result);

      expect(existing.length).equal(2);
    });

    it("should not return poems that are on auction", async () => {
      await producePoem();
      await producePoem();

      const result = await decentPoems.getMinted(0);

      expect(result[0].createdAt).equal(0);
    });

    it("should return max PAGE_SIZE minted poems for page 0 when more than PAGE_SIZE + 1 poems exist", async () => {
      const pageSize = await decentPoems.PAGE_SIZE();
      const price = await decentPoems._auctionStartPrice();
      for (let i = 0; i < pageSize.toNumber() + 1; i++) {
        await producePoem();
        await decentPoems.safeMint(alice.address, i, { value: price });
      }

      const result = await decentPoems.getMinted(0);
      let existing = getExisting(result);

      expect(existing.length).equal(pageSize);
    });

    it("should return 1 minted poems for page 1 when PAGE_SIZE + 1 poems exist", async () => {
      const pageSize = await decentPoems.PAGE_SIZE();
      const price = await decentPoems._auctionStartPrice();
      for (let i = 0; i < pageSize.toNumber() + 1; i++) {
        await producePoem();
        await decentPoems.safeMint(alice.address, i, { value: price });
      }

      const result = await decentPoems.getMinted(1);
      const existing = getExisting(result);

      expect(existing.length).equal(1);
    });
  });
});
