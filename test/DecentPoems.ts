import { ethers } from "hardhat";
import chai from "chai";
import { MockContract, smock } from "@defi-wonderland/smock";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import {
  DecentPoems,
  DecentPoemsRenderer__factory,
  DecentPoems__factory,
  DecentWords,
  DecentWords__factory,
  MockSplitMain,
  MockSplitMain__factory,
  MockVRFCoordinator,
  MockVRFCoordinator__factory,
} from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { setEVMTimestamp, mineEVMBlock } from "./evm";
import { parseEther } from "ethers/lib/utils";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

describe("DecentPoems", () => {
  let decentPoems: DecentPoems;
  let mockDecentWords: MockContract<DecentWords>;
  let mockSplitMain: MockContract<MockSplitMain>;
  let mockVrfCoordinator: MockContract<MockVRFCoordinator>;
  let mockDecentPoemsRenderer: any;
  let fakeVrfSubscriptionId = 42;
  let fakeVrfKeyHash = ethers.utils.formatBytes32String("42");
  let deployer: SignerWithAddress,
    bob: SignerWithAddress,
    carl: SignerWithAddress,
    ben: SignerWithAddress,
    abe: SignerWithAddress;

  beforeEach(async () => {
    [deployer, bob, carl, ben, abe] = await ethers.getSigners();

    const mockDecentWordsFactory = await smock.mock<DecentWords__factory>(
      "DecentWords"
    );
    mockDecentWords = await mockDecentWordsFactory.deploy();

    const mockDecentPoemsRendererFactory =
      await smock.mock<DecentPoemsRenderer__factory>("DecentPoemsRenderer");
    mockDecentPoemsRenderer = await mockDecentPoemsRendererFactory.deploy();

    const mockSplitMainFactory = await smock.mock<MockSplitMain__factory>(
      "MockSplitMain"
    );
    mockSplitMain = await mockSplitMainFactory.deploy();
    mockSplitMain.createSplit.returns(deployer.address);

    const mockVrfCoordinatorFactory =
      await smock.mock<MockVRFCoordinator__factory>("MockVRFCoordinator");
    mockVrfCoordinator = await mockVrfCoordinatorFactory.deploy();

    const DecentPoemsFactory = (await ethers.getContractFactory(
      "DecentPoems"
    )) as DecentPoems__factory;

    decentPoems = await DecentPoemsFactory.deploy(
      mockDecentWords.address,
      mockDecentPoemsRenderer.address,
      mockSplitMain.address,
      7,
      mockVrfCoordinator.address,
      fakeVrfSubscriptionId,
      fakeVrfKeyHash
    );
    await decentPoems.deployed();
    await decentPoems.useVRF(false);

    mockDecentWords.total.returns(1);
    mockDecentWords.words.returns("test");
  });

  async function producePoem(prefix: string = "") {
    for (let i = 0; i < 7; i++) {
      await decentPoems.connect(bob).submitVerse(prefix, 0, "");
    }
  }

  async function expirePoem(poemIndex: number) {
    const createdAt = (await decentPoems.getPoem(poemIndex)).createdAt;
    const auctionDuration = await decentPoems._auctionDuration();
    await setEVMTimestamp(
      createdAt.toNumber() + auctionDuration.toNumber() + 1
    );
    await mineEVMBlock();
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

    it("should fail if seed is 0", async () => {
      // Given that the mock VRF will not call the random fulfillment function,
      // the seed will remain to 0
      await decentPoems.useVRF(true);
      mockVrfCoordinator.getSubscription.returns([
        parseEther("2"),
        2,
        bob.address,
        [],
      ]);
      await decentPoems.resetRandomSeed();

      await expect(decentPoems.getCurrentWord()).revertedWith(
        "Word not generated yet"
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
      const authors = [bob, deployer, bob, deployer, deployer, bob, bob];
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

    it("should emit VerseSubmitted", async () => {
      await expect(decentPoems.connect(bob).submitVerse("1", 0, "3"))
        .to.emit(decentPoems, "VerseSubmitted")
        .withArgs(bob.address, 0);
    });

    it("should emit PoemCreated after submitting the last verse", async () => {
      for (let i = 0; i < 6; i++) {
        await decentPoems.connect(bob).submitVerse("", 0, "");
      }

      await expect(decentPoems.connect(carl).submitVerse("", 0, ""))
        .to.emit(decentPoems, "PoemCreated")
        .withArgs(carl.address, 1);
    });

    it("should emit WordGenerated", async () => {
      await expect(decentPoems.connect(bob).submitVerse("1", 0, "3")).to.emit(
        decentPoems,
        "WordGenerated"
      );
    });

    describe("useVRF == true", async () => {
      beforeEach(async () => {
        await decentPoems.useVRF(true);
      });

      it("should call vrf contract for randomness when vrf coordinator balance greater than 1 ether", async () => {
        mockVrfCoordinator.getSubscription.returns([
          parseEther("2"),
          0,
          bob.address,
          [],
        ]);
        await decentPoems.submitVerse("1", 0, "3");

        mockVrfCoordinator.requestRandomWords
          .atCall(0)
          .calledWith(fakeVrfKeyHash, fakeVrfSubscriptionId, 2, 100000, 1);
      });

      it("should not call vrf contract for randomness when vrf coordinator balance less than 1 ether", async () => {
        mockVrfCoordinator.getSubscription.returns([
          parseEther("0.1"),
          0,
          bob.address,
          [],
        ]);
        await decentPoems.submitVerse("1", 0, "3");

        expect(mockVrfCoordinator.requestRandomWords.getCall(0)).be.undefined;
      });

      it("should fallback to blockhash when vrf coordinator balance less than 1 ether", async () => {
        mockVrfCoordinator.getSubscription.returns([
          parseEther("0.1"),
          0,
          bob.address,
          [],
        ]);
        await decentPoems.submitVerse("1", 0, "3");

        expect(await decentPoems.getCurrentWord()).deep.equal([
          BigNumber.from(0),
          "test",
        ]);
      });

      it("should fail until randomness is fulfilled", async () => {
        mockVrfCoordinator.getSubscription.returns([
          parseEther("1"),
          0,
          bob.address,
          [],
        ]);
        await decentPoems.submitVerse("1", 0, "3");

        await expect(decentPoems.submitVerse("", 0, "")).revertedWith(
          "Word not generated yet"
        );
      });

      it("should succeed after randomness is fulfilled", async () => {
        mockVrfCoordinator.getSubscription.returns([
          parseEther("1"),
          0,
          bob.address,
          [],
        ]);
        await decentPoems.submitVerse("1", 0, "3");
        await mockVrfCoordinator.mock_fulfillRandomness(
          [42],
          decentPoems.address
        );

        await decentPoems.submitVerse("", 0, "");
      });
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
      await decentPoems.safeMint(deployer.address, 0, { value: price });

      await expect(decentPoems.getCurrentPrice(0)).revertedWith(
        "Poem already minted"
      );
    });

    it("should fail if poem is expired", async () => {
      await producePoem();
      await expirePoem(0);

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
      const [resultIds, resultPoems] = await decentPoems.getAuctions();

      expect(resultIds.length).equal(0);
      expect(resultPoems.length).equal(0);
    });

    it("should return all poems created within the auction duration time", async () => {
      await producePoem();
      await producePoem();

      const [resultIds, resultPoems] = await decentPoems.getAuctions();

      expect(resultIds.length).equal(2);
      expect(resultPoems.length).equal(2);
    });

    it("should not return poems that have been minted", async () => {
      await producePoem();
      const price = await decentPoems._auctionStartPrice();
      await decentPoems.safeMint(deployer.address, 0, { value: price });

      const [resultIds, resultPoems] = await decentPoems.getAuctions();

      expect(resultIds.length).equal(0);
      expect(resultPoems.length).equal(0);
    });

    it("should not return expired poems", async () => {
      await producePoem();
      await expirePoem(0);

      const [resultIds, resultPoems] = await decentPoems.getAuctions();

      expect(resultIds.length).equal(0);
      expect(resultPoems.length).equal(0);
    });
  });

  describe("getPoemFromTokenId", async () => {
    it("should return first minted poem for token 1", async () => {
      mockDecentWords.words.returns("");
      await producePoem("minted");
      await decentPoems.safeMint(bob.address, 0, { value: parseEther("1") });

      const result = await decentPoems.getPoemFromTokenId(1);

      expect(result.verses[0]).equal("minted");
    });

    it("should fail for token 0", async () => {
      await producePoem();

      await expect(decentPoems.getPoemFromTokenId(0)).revertedWith(
        "Non existing token"
      );
    });

    it("should fail for token beyond supply", async () => {
      await expect(decentPoems.getPoemFromTokenId(1)).revertedWith(
        "Non existing token"
      );
    });
  });

  describe("getMinted", async () => {
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
      await decentPoems.safeMint(deployer.address, 0, { value: price });
      await decentPoems.safeMint(deployer.address, 1, { value: price });

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
        await decentPoems.safeMint(deployer.address, i, { value: price });
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
        await decentPoems.safeMint(deployer.address, i, { value: price });
      }

      const result = await decentPoems.getMinted(1);
      const existing = getExisting(result);

      expect(existing.length).equal(1);
    });

    it("should return poems in ascending order", async () => {
      const pageSize = await decentPoems.PAGE_SIZE();
      const price = await decentPoems._auctionStartPrice();
      for (let i = 0; i < pageSize.toNumber() + 1; i++) {
        await producePoem();
        await decentPoems.safeMint(deployer.address, i, { value: price });
      }

      const page0 = await decentPoems.getMinted(0);
      let existing = getExisting(page0);
      const page1 = await decentPoems.getMinted(1);
      existing = existing.concat(getExisting(page1));

      let previousMintedAt = existing[0].mintedAt.toNumber();
      for (let i = 1; i < existing.length; i++) {
        const mintedAt = existing[i].mintedAt.toNumber();
        expect(mintedAt).lessThan(previousMintedAt);
        previousMintedAt = mintedAt;
      }
    });

    it("returns empty when page is beyond total", async () => {
      const pageSize = await decentPoems.PAGE_SIZE();
      const price = await decentPoems._auctionStartPrice();
      for (let i = 0; i < pageSize.toNumber(); i++) {
        await producePoem();
        await decentPoems.safeMint(deployer.address, i, { value: price });
      }

      const result = await decentPoems.getMinted(1);
      let existing = getExisting(result);

      expect(existing.length).equal(0);
    });
  });

  describe("safeMint", async () => {
    it("should not allow minting of an unfinished poem", async () => {
      await expect(
        decentPoems.safeMint(deployer.address, 0, { value: parseEther("10") })
      ).revertedWith("Invalid poem");
    });

    it("should not allow minting of an expired poem", async () => {
      await producePoem();
      await expirePoem(0);
      await expect(
        decentPoems.safeMint(deployer.address, 0, { value: parseEther("10") })
      ).revertedWith("Auction expired");
    });

    it("should allow minting of an auctioned poem", async () => {
      await producePoem();
      const price = await decentPoems.getCurrentPrice(0);

      await decentPoems.safeMint(deployer.address, 0, { value: price });

      expect(await decentPoems.ownerOf(1)).equal(deployer.address);
      expect(await decentPoems.balanceOf(deployer.address)).equal(1);
    });

    it("should mint incremental token ids, even with non incremental poems", async () => {
      await producePoem();
      let price = await decentPoems.getCurrentPrice(0);
      await decentPoems.safeMint(deployer.address, 0, { value: price });

      await producePoem();
      await expirePoem(1);

      mockDecentWords.words.returns("");
      await producePoem("test");
      price = await decentPoems.getCurrentPrice(2);
      await decentPoems.safeMint(deployer.address, 2, { value: price });

      const result = await decentPoems.getPoemFromTokenId(1);
      expect(result.verses[0]).equal("test");
    });

    it("should not allow minting at a price lower than current", async () => {
      await producePoem();
      const price = await decentPoems.getCurrentPrice(0);

      await expect(
        decentPoems.safeMint(deployer.address, 0, { value: price.div(2) })
      ).revertedWith("Insufficient ether");
    });

    it("should not allow minting the same poem twice", async () => {
      await producePoem();
      const price = await decentPoems.getCurrentPrice(0);
      await decentPoems.safeMint(deployer.address, 0, { value: price });

      await expect(
        decentPoems.safeMint(deployer.address, 0, { value: price })
      ).revertedWith("Poem already minted");
    });

    it("should distribute to the creator the minting royalty", async () => {
      await producePoem();
      const price = parseEther("1");
      const royalty = await decentPoems._creatorRoyalty();
      const scale = await decentPoems.PERCENTAGE_SCALE();
      const creatorSplit = price.div(scale).mul(royalty);
      const aliceOldBalance = await deployer.getBalance();

      await decentPoems.connect(bob).safeMint(bob.address, 0, { value: price });

      expect(await deployer.getBalance()).equal(
        aliceOldBalance.add(creatorSplit)
      );
    });

    it("should distribute the value after minting royalty equally among authors", async () => {
      const authors = [bob, abe, carl, ben, abe, carl, abe];
      for (let i = 0; i < 7; i++) {
        await decentPoems.connect(authors[i]).submitVerse("", 0, "");
      }

      const price = parseEther("1");
      const creatorRoyalty = await decentPoems._creatorRoyalty();
      const scale = await decentPoems.PERCENTAGE_SCALE();
      const ownerSplit = price.div(scale).mul(creatorRoyalty);
      const authorSplit = price.sub(ownerSplit).div(7);

      const bobContribution = 1;
      const abeContribution = 3;
      const carlContribution = 2;
      const benContribution = 1;

      const bobOldBalance = await bob.getBalance();
      const abeOldBalance = await abe.getBalance();
      const carlOldBalance = await carl.getBalance();
      const benOldBalance = await ben.getBalance();

      await decentPoems.safeMint(deployer.address, 0, { value: price });

      expect(await bob.getBalance()).equal(
        bobOldBalance.add(authorSplit.mul(bobContribution))
      );
      expect(await abe.getBalance()).equal(
        abeOldBalance.add(authorSplit.mul(abeContribution))
      );
      expect(await carl.getBalance()).equal(
        carlOldBalance.add(authorSplit.mul(carlContribution))
      );
      expect(await ben.getBalance()).equal(
        benOldBalance.add(authorSplit.mul(benContribution))
      );
    });

    it("should create a split for the future royalties", async () => {
      const authors = [bob, abe, carl, ben, abe, carl, abe];

      for (let i = 0; i < 7; i++) {
        await decentPoems.connect(authors[i]).submitVerse("", 0, "");
      }

      const recipients = authors.concat(deployer);

      const price = await decentPoems.getCurrentPrice(0);
      const scale = await decentPoems.PERCENTAGE_SCALE();
      const creatorRoyalty = await decentPoems._creatorRoyalty();
      const unitAllocation = (scale - creatorRoyalty) / 7;
      const percentages = {
        [bob.address]: unitAllocation,
        [abe.address]: unitAllocation * 3,
        [carl.address]: unitAllocation * 2,
        [ben.address]: unitAllocation,
        [deployer.address]: creatorRoyalty,
      };

      await decentPoems.safeMint(deployer.address, 0, { value: price });

      const recipientAddresses = recipients.map((a) => a.address);
      const sortedRecipientAddresses = [...new Set(recipientAddresses.sort())];

      const expectedAllocations = sortedRecipientAddresses.map((address) =>
        Math.floor(percentages[address])
      );

      const sum = expectedAllocations.reduce((x, y) => x + y);
      expectedAllocations[0] += scale - sum;

      expect(mockSplitMain.createSplit.getCall(0).args[0]).eql(
        sortedRecipientAddresses
      );
      expect(mockSplitMain.createSplit.getCall(0).args[1]).eql(
        expectedAllocations
      );
      expect(mockSplitMain.createSplit.getCall(0).args[2]).equals(1e3);
      expect(mockSplitMain.createSplit.getCall(0).args[3]).equals(
        deployer.address
      );
    });

    it("should add the split to the poem", async () => {
      await producePoem();
      const price = await decentPoems.getCurrentPrice(0);
      mockSplitMain.createSplit.returns(abe.address);
      await decentPoems.safeMint(deployer.address, 0, { value: price });

      const result = await decentPoems.getPoem(0);

      expect(result.split).equal(abe.address);
    });
  });

  describe("tokenURI", async () => {
    it("should return the renderer response for the given token id", async () => {
      await producePoem("test");
      const price = await decentPoems.getCurrentPrice(0);
      mockSplitMain.createSplit.returns(abe.address);
      await decentPoems.safeMint(deployer.address, 0, { value: price });

      const expectedInputVerses = [
        "testtest",
        "testtest",
        "testtest",
        "testtest",
        "testtest",
        "testtest",
        "testtest",
      ];

      const expectedInputWords = [
        "test",
        "test",
        "test",
        "test",
        "test",
        "test",
        "test",
      ];

      const expectedInputAuthors = [
        bob.address,
        bob.address,
        bob.address,
        bob.address,
        bob.address,
        bob.address,
        bob.address,
      ];

      mockDecentPoemsRenderer.getJSON
        .whenCalledWith(
          expectedInputVerses,
          expectedInputWords,
          expectedInputAuthors,
          abe.address
        )
        .returns("success");

      const result = await decentPoems.tokenURI(1);

      expect(result).equal("success");
    });

    it("should fail for a non minted poem id", async () => {
      await producePoem();

      await expect(decentPoems.tokenURI(1)).revertedWith("Non existing token");
    });

    describe("poemURI", async () => {
      it("should return the renderer response for the given poem index", async () => {
        await producePoem("another");

        const expectedInputVerses = [
          "anothertest",
          "anothertest",
          "anothertest",
          "anothertest",
          "anothertest",
          "anothertest",
          "anothertest",
        ];

        const expectedInputWords = [
          "test",
          "test",
          "test",
          "test",
          "test",
          "test",
          "test",
        ];

        const expectedInputAuthors = [
          bob.address,
          bob.address,
          bob.address,
          bob.address,
          bob.address,
          bob.address,
          bob.address,
        ];

        mockDecentPoemsRenderer.getJSON
          .whenCalledWith(
            expectedInputVerses,
            expectedInputWords,
            expectedInputAuthors,
            ethers.constants.AddressZero
          )
          .returns("success");

        const result = await decentPoems.poemURI(0);

        expect(result).equal("success");
      });
    });
  });
});
