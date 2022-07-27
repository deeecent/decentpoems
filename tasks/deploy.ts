import { task } from "hardhat/config";
import { readFile, writeFile } from "fs/promises";
import {
  DecentPoems,
  DecentPoems__factory,
  DecentWords,
  DecentWords__factory,
} from "../typechain";
import { readFileSync } from "fs";

task("deploy-words", "Deploy Decent Words")
  .addParam("wordsFile")
  .setAction(async ({ wordsFile }, hre) => {
    const words = readFileSync(wordsFile, "utf-8").split("\n");
    console.log("Deploy contract DecentWords");
    const configPath = "./artifacts/network.json";
    const networks: any = JSON.parse(await readFile(configPath, "utf8"));
    const [deployer] = await hre.ethers.getSigners();
    const { chainId, name: networkName } =
      await hre.ethers.provider.getNetwork();
    const addresses = networks[chainId];
    const address = addresses["DecentWords"]!;

    const decentWordsContract = DecentWords__factory.connect(
      address,
      deployer
    ) as DecentWords;
    /*
    const decentWordsFactory = await hre.ethers.getContractFactory(
      "DecentWords"
    );
    const decentWordsContract = await decentWordsFactory.deploy();
    await decentWordsContract.deployed();

    const { chainId } = await hre.ethers.provider.getNetwork();

    const config = {
      [chainId]: {
        DecentWords: decentWordsContract.address,
      },
    };

    console.log("Configuration file in ./artifacts/network.json");
    await writeFile(
      "./artifacts/network.json",
      JSON.stringify(config, null, 2)
    );*/

    const bytesPerChunk = 60; //3000; //6000;
    let lastIndex = 0;

    while (lastIndex < 20) {
      //words.length) {
      console.log(lastIndex);
      let bytes = 0;
      let end = lastIndex;
      while (end < words.length && bytes + words[end].length < bytesPerChunk) {
        bytes += words[end].length;
        end++;
      }
      const chunk = words.slice(lastIndex, end);
      console.log(chunk.length);
      const tx = await decentWordsContract.addWords(chunk, lastIndex);
      await tx.wait(1);

      lastIndex = end;
    }
  });

task("deploy", "Deploy DecentPoems")
  .addParam("wordsAddress")
  .setAction(async ({ wordsAddress }, hre) => {
    console.log("Deploy contract DecentPoems");

    const decentPoemsFactory = await hre.ethers.getContractFactory(
      "DecentPoems"
    );
    const decentPoemsContract = await decentPoemsFactory.deploy(
      wordsAddress,
      7
    );
    console.log("  Address", decentPoemsContract.address);
    const receipt = await decentPoemsContract.deployed();
    console.log("  Receipt", receipt.deployTransaction.hash);

    const { chainId } = await hre.ethers.provider.getNetwork();

    const config = {
      [chainId]: {
        DecentPoems: decentPoemsContract.address,
      },
    };

    console.log("Configuration file in ./artifacts/network.json");
    await writeFile(
      "./artifacts/network.json",
      JSON.stringify(config, null, 2)
    );
  });

task("deploy-test", "Deploy Test NFT", async (_, hre) => {
  console.log("Deploy contract Renderer");
  const rendererFactory = await hre.ethers.getContractFactory("Renderer");

  const rendererContract = await rendererFactory.deploy();
  console.log("  Address", rendererContract.address);
  const receipt = await rendererContract.deployed();
  console.log("  Receipt", receipt.deployTransaction.hash);

  const { chainId } = await hre.ethers.provider.getNetwork();

  const config = {
    [chainId]: {
      Renderer: rendererContract.address,
    },
  };

  console.log("Configuration file in ./artifacts/network.json");
  await writeFile("./artifacts/network.json", JSON.stringify(config, null, 2));
});
