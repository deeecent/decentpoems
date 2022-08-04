import { task } from "hardhat/config";
import { DecentPoems, DecentPoemsRenderer, DecentWords } from "../typechain";
import { readFileSync } from "fs";
import { loadContract, deployContract } from "./utils";
import { BigNumber } from "ethers";

task("set-vrf", "Set VRF on/off")
  .addPositionalParam("activated", "true/false")
  .setAction(async ({ activated }, hre) => {
    console.log("Load contract DecentPoems");
    const decentPoemsContract = (await loadContract(
      hre,
      "DecentPoems"
    )) as DecentPoems;

    console.log(`Contract ${decentPoemsContract.address} loaded.`);
    console.log(`   Setting VRF to ${activated}`);
    await decentPoemsContract.useVRF(activated);
    console.log(`VRF ${activated ? "activated" : "deactivated"}.`);
  });

task("word", "Get current word").setAction(async (_, hre) => {
  console.log("Load contract DecentPoems");
  const decentPoemsContract = (await loadContract(
    hre,
    "DecentPoems"
  )) as DecentPoems;

  console.log(`Contract ${decentPoemsContract.address} loaded.`);

  const currentWord = await decentPoemsContract.getCurrentWord();
  console.log(`Word: ${currentWord}.`);
});

task("reset-seed", "Get current word").setAction(async (_, hre) => {
  console.log("Load contract DecentPoems");
  const decentPoemsContract = (await loadContract(
    hre,
    "DecentPoems"
  )) as DecentPoems;

  console.log(`Contract ${decentPoemsContract.address} loaded.`);

  const currentWord = await decentPoemsContract.resetRandomSeed();
  console.log(`Seed reset.`);
});

task("populate", "Populate Decent Words")
  .addParam("wordsFile")
  .setAction(async ({ wordsFile }, hre) => {
    const words = readFileSync(wordsFile, "utf-8").split("\n");
    const decentWordsContract = (await loadContract(
      hre,
      "DecentWords"
    )) as DecentWords;

    if (decentWordsContract === undefined) {
      console.error("Contract not deployed yet.");
      return;
    }

    const chunkSizes = [
      898, 917, 946, 928, 884, 884, 906, 914, 869, 946, 946, 946, 852, 946, 946,
      928, 914, 917, 884, 914, 917, 931, 946, 914, 928, 906, 931, 564,
    ];
    let lastIndex = (await decentWordsContract.total()).toNumber();
    if (lastIndex === words.length) {
      console.log("Already populated.");
      return;
    }

    console.log(`Populating from ${lastIndex}`);

    for (let i = 0, j = 0; i < chunkSizes.length; i++) {
      if (j < lastIndex) {
        j += chunkSizes[i];
      } else {
        const chunk = words.slice(j, j + chunkSizes[i]);
        await decentWordsContract.addWords(chunk);
        j += chunkSizes[i];
      }
    }
  });

task("populate-localhost", "Populate Decent Words")
  .addParam("wordsFile")
  .setAction(async ({ wordsFile }, hre) => {
    const words = readFileSync(wordsFile, "utf-8").split("\n");
    const decentWordsContract = (await loadContract(
      hre,
      "DecentWords"
    )) as DecentWords;

    if (decentWordsContract === undefined) {
      console.error("Contract not deployed yet.");
      return;
    }

    const wordsPerChunk = 100;
    let lastIndex = (await decentWordsContract.total()).toNumber();
    if (lastIndex === words.length) {
      console.log("Already populated.");
      return;
    }

    console.log(`Populating from ${lastIndex}`);

    while (lastIndex < words.length) {
      const chunk = words.slice(lastIndex, lastIndex + wordsPerChunk);
      const tx = await decentWordsContract.addWords(chunk);
      //await tx.wait(1);

      lastIndex = Math.min(lastIndex + wordsPerChunk, words.length);
      console.log(`Next starting index ${lastIndex}`);
    }
  });

task("deploy-split", "Deploy Split mock").setAction(async (_, hre) => {
  console.log("Deploy *mock* contract Split");
  await deployContract(hre, "SplitMain");
});

task("deploy-words", "Deploy DecentWords").setAction(async (_, hre) => {
  console.log("Deploy contract DecentWords");
  await deployContract(hre, "DecentWords");
});

task("deploy-renderer", "Deploy DecentPoemsRenderer").setAction(
  async (_, hre) => {
    console.log("Deploy contract DecentPoemsRenderer");
    await deployContract(hre, "DecentPoemsRenderer");
  }
);

task("deploy-poems", "Deploy DecentPoems").setAction(async (_, hre) => {
  console.log("Load contract DecentWords");
  const decentWordsContract = (await loadContract(
    hre,
    "DecentWords"
  )) as DecentWords;

  if (decentWordsContract === undefined) {
    console.error("You need to first deploy DecentWords");
    return;
  }

  console.log("Load contract DecentPoemsRenderer");
  const decentPoemsRendererContract = (await loadContract(
    hre,
    "DecentPoemsRenderer"
  )) as DecentPoemsRenderer;

  if (decentPoemsRendererContract === undefined) {
    console.error("You need to first deploy DecentPoemsRenderer");
    return;
  }

  console.log("Deploy contract DecentPoems");
  console.log(`   0xSplit address: ${process.env.SPLIT_ADDRESS}`);
  console.log(`   VRF Coordinator: ${process.env.VRF_COORDINATOR_ADDRESS}`);
  console.log(`   VRF Key Hash: ${process.env.VRF_KEY_HASH}`);
  console.log(`   VRF Subscription ID: ${process.env.VRF_SUBSCRIPTION_ID}`);
  await deployContract(
    hre,
    "DecentPoems",
    { DecentPoemsRenderer: decentPoemsRendererContract.address },
    decentWordsContract.address,
    process.env.SPLIT_ADDRESS,
    7,
    process.env.VRF_COORDINATOR_ADDRESS,
    BigNumber.from(process.env.VRF_SUBSCRIPTION_ID),
    process.env.VRF_KEY_HASH
  );
});
