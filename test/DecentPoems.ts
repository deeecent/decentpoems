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
});
