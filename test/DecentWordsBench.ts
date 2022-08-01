import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DecentWordsV1__factory } from "../typechain/factories/contracts/DecentWordsV1__factory";
import { DecentWordsV2__factory } from "../typechain/factories/contracts/DecentWordsV2__factory";
import { DecentWordsV3__factory } from "../typechain/factories/contracts/DecentWordsV3__factory";
import { DecentWordsV1 } from "../typechain/contracts/DecentWordsV1";
import { DecentWordsV2 } from "../typechain/contracts/DecentWordsV2";
import { DecentWordsV3 } from "../typechain/contracts/DecentWordsV3";
import { readFileSync } from "fs";
import { ContractFactory } from "ethers";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

describe.skip("DecentWords Benchmark", () => {
  let decentWordsV1: DecentWordsV1;
  let decentWordsV2: DecentWordsV2;
  let decentWordsV3: DecentWordsV3;
  let alice: SignerWithAddress, bob: SignerWithAddress;

  async function findMax(
    contractFactory: ContractFactory,
    wordsFun: (chunkSize: number) => any[]
  ) {
    let done = false;
    let size = 2000;
    let increment = size / 2;
    let lastValidSize = 0;

    while (!done) {
      let contract = await contractFactory.deploy();
      await contract.deployed();

      const chunk = wordsFun(size);

      try {
        await contract.addWords(chunk);
        lastValidSize = chunk.length;
        size = size + increment;
      } catch (e) {
        size = size - increment;
      }
      increment = Math.floor(increment / 2);

      done = increment == 0;
    }

    return lastValidSize;
  }

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();

    const DecentWordsV1Factory = (await ethers.getContractFactory(
      "DecentWordsV1",
      alice
    )) as DecentWordsV1__factory;
    decentWordsV1 = await DecentWordsV1Factory.deploy();
    await decentWordsV1.deployed();

    const DecentWordsV2Factory = (await ethers.getContractFactory(
      "DecentWordsV2",
      alice
    )) as DecentWordsV2__factory;
    decentWordsV2 = await DecentWordsV2Factory.deploy();
    await decentWordsV2.deployed();

    const DecentWordsV3Factory = (await ethers.getContractFactory(
      "DecentWordsV3",
      alice
    )) as DecentWordsV3__factory;
    decentWordsV3 = await DecentWordsV3Factory.deploy();
    await decentWordsV3.deployed();
  });

  const words = readFileSync("popular.txt", "utf-8").split("\n");

  describe("addWords", async () => {
    it("v1 static", async () => {
      const chunkSize = 834;
      for (let i = 0; i < words.length / chunkSize; i++) {
        const chunk = words.slice(i * chunkSize, i * chunkSize + chunkSize);
        await decentWordsV1.addWords(chunk);
      }

      expect(await decentWordsV1.total()).equal(25322);
    });

    it("v1 execution plan", async () => {
      const chunkSizes = [
        898, 917, 946, 928, 884, 884, 906, 914, 869, 946, 946, 946, 852, 946,
        946, 928, 914, 917, 884, 914, 917, 931, 946, 914, 928, 906, 931, 564,
      ];
      console.log(`      Total calls: ${chunkSizes.length}`);
      for (let i = 0, j = 0; i < chunkSizes.length; i++) {
        const chunk = words.slice(j, j + chunkSizes[i]);
        await decentWordsV1.addWords(chunk);
        j += chunkSizes[i];
      }

      expect(await decentWordsV1.total()).equal(25322);
    });

    it("v2 static", async () => {
      const chunkSize = 834;
      for (let i = 0; i < words.length / chunkSize; i++) {
        const chunk = words.slice(i * chunkSize, i * chunkSize + chunkSize);
        await decentWordsV2.addWords(chunk);
      }

      expect(await decentWordsV2.total()).equal(25322);
    });

    it("v2 execution plan", async () => {
      const chunkSizes = [
        898, 917, 946, 928, 884, 884, 906, 914, 869, 946, 946, 946, 852, 946,
        946, 928, 914, 917, 884, 914, 917, 931, 946, 914, 928, 906, 931, 564,
      ];
      console.log(`      Total calls: ${chunkSizes.length}`);
      for (let i = 0, j = 0; i < chunkSizes.length; i++) {
        const chunk = words.slice(j, j + chunkSizes[i]);
        await decentWordsV2.addWords(chunk);
        j += chunkSizes[i];
      }

      expect(await decentWordsV2.total()).equal(25322);
    });

    it("v3 static", async () => {
      const chunkSize = 1308;
      for (let i = 0; i < words.length / chunkSize; i++) {
        const chunk = words.slice(i * chunkSize, i * chunkSize + chunkSize);
        const chunkBytes = chunk.map((c) => ethers.utils.toUtf8Bytes(c));
        await decentWordsV3.addWords(chunkBytes);
      }

      expect(await decentWordsV3.total()).equal(25322);
    });

    it("v3 execution plan", async () => {
      const chunkSizes = [
        1307, 1304, 1304, 1307, 1307, 1307, 1307, 1304, 1307, 1304, 1304, 1304,
        1307, 1307, 1304, 1304, 1307, 1304, 1307, 516,
      ];

      console.log(`      Total calls: ${chunkSizes.length}`);
      for (let i = 0, j = 0; i < chunkSizes.length; i++) {
        const chunk = words.slice(j, j + chunkSizes[i]);
        const chunkBytes = chunk.map((c) => ethers.utils.toUtf8Bytes(c));
        await decentWordsV3.addWords(chunkBytes);

        j += chunkSizes[i];
      }

      expect(await decentWordsV3.total()).equal(25322);
    });
  });

  describe("execution plans", async () => {
    it("execution plan v1", async () => {
      let chunks: number[] = [];
      const DecentWordsV1Factory = (await ethers.getContractFactory(
        "DecentWordsV1",
        alice
      )) as DecentWordsV1__factory;

      for (let i = 0; i < words.length; ) {
        const result = await findMax(DecentWordsV1Factory, (size: number) => {
          return words.slice(i, Math.min(i + size, words.length));
        });

        chunks.push(result);
        i += result;
      }

      console.log(chunks);
    });

    it("execution plan v2", async () => {
      let chunks: number[] = [];
      const DecentWordsV2Factory = (await ethers.getContractFactory(
        "DecentWordsV2",
        alice
      )) as DecentWordsV2__factory;

      for (let i = 0; i < words.length; ) {
        const result = await findMax(DecentWordsV2Factory, (size: number) => {
          return words.slice(i, Math.min(i + size, words.length));
        });

        chunks.push(result);
        i += result;
      }

      console.log(chunks);
    });

    it("execution plan v3", async () => {
      let chunks: number[] = [];
      const DecentWordsV3Factory = (await ethers.getContractFactory(
        "DecentWordsV3",
        alice
      )) as DecentWordsV3__factory;

      for (let i = 0; i < words.length; ) {
        const result = await findMax(DecentWordsV3Factory, (size: number) => {
          const chunk = words.slice(i, Math.min(i + size, words.length));
          return chunk.map((c) => ethers.utils.toUtf8Bytes(c));
        });

        chunks.push(result);
        i += result;
      }

      console.log(chunks);
    });
  });
});
