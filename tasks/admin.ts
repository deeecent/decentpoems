import { task } from "hardhat/config";
import { DecentPoems, DecentPoemsRenderer, DecentWords } from "../typechain";
import { readFileSync } from "fs";
import { loadContract, deployContract } from "./utils";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

task("create-poem", "Creates a test poem").setAction(async (_, hre) => {
  console.log("Load contract DecentPoems");
  const decentPoemsContract = (await loadContract(
    hre,
    "DecentPoems"
  )) as DecentPoems;

  console.log(`Contract ${decentPoemsContract.address} loaded.`);
  for (let i = 0; i < 7; i++) {
    console.log(`sentence ${i}`);
    let notGenerated = true;
    let word;
    while (notGenerated) {
      try {
        word = await decentPoemsContract.getCurrentWord();
        notGenerated = false;
        const prefix =
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ";
        const tx = await decentPoemsContract.submitVerse(
          `${prefix}${word[0]}, Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.`,
          prefix.length
        );

        await tx.wait(1);
      } catch (e) {}
    }
  }
});

task("set-vrf", "Set VRF on/off")
  .addPositionalParam("activated", "true/false")
  .setAction(async ({ activated }, hre) => {
    console.log("Load contract DecentPoems");
    const decentPoemsContract = (await loadContract(
      hre,
      "DecentPoems"
    )) as DecentPoems;

    const activate = activated == "true" ? true : false;

    console.log(`Contract ${decentPoemsContract.address} loaded.`);
    console.log(`   Setting VRF to ${activate}`);
    await decentPoemsContract.useVRF(activate);
    console.log(`VRF ${activate ? "activated" : "deactivated"}.`);
  });

task("set-auction", "Set Auction parameters")
  .addParam("duration", "Auction duration in seconds")
  .addParam("startPrice", "Start price in MATIC")
  .addParam("endPrice", "End price in MATIC")
  .setAction(async ({ duration, startPrice, endPrice }, hre) => {
    console.log("Load contract DecentPoems");
    const decentPoemsContract = (await loadContract(
      hre,
      "DecentPoems"
    )) as DecentPoems;

    console.log(`Contract ${decentPoemsContract.address} loaded.`);
    console.log(`   Setting duration to ${duration}`);
    console.log(`   Setting start price to ${startPrice} MATIC`);
    console.log(`   Setting end price to ${endPrice} MATIC`);
    await decentPoemsContract.setAuctionParams(
      duration,
      parseEther(startPrice),
      parseEther(endPrice)
    );
    console.log(`Done.`);
  });

task("mint", "Mint poem")
  .addParam("index", "The poem index")
  .addParam("to", "To address")
  .setAction(async ({ index, to }, hre) => {
    console.log("Load contract DecentPoems");
    const decentPoemsContract = (await loadContract(
      hre,
      "DecentPoems"
    )) as DecentPoems;

    console.log(`Contract ${decentPoemsContract.address} loaded.`);
    console.log(`   Minting poem ${index} to ${to}`);
    const currentPrice = decentPoemsContract.getCurrentPrice(index);
    await decentPoemsContract.safeMint(to, index, { value: currentPrice });
    console.log(`Done`);
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

task("auctions", "Get auctions").setAction(async (_, hre) => {
  console.log("Load contract DecentPoems");
  const decentPoemsContract = (await loadContract(
    hre,
    "DecentPoems"
  )) as DecentPoems;

  console.log(`Contract ${decentPoemsContract.address} loaded.`);

  const auctions = await decentPoemsContract.getAuctions();
  console.log(`Auctions: ${auctions}.`);
});

task("reset-seed", "Get current word").setAction(async (_, hre) => {
  console.log("Load contract DecentPoems");
  const decentPoemsContract = (await loadContract(
    hre,
    "DecentPoems"
  )) as DecentPoems;

  console.log(`Contract ${decentPoemsContract.address} loaded.`);

  const tx = await decentPoemsContract.resetRandomSeed();
  await tx.wait(3);
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

    const chunkSize = 830;
    let lastIndex = (await decentWordsContract.total()).toNumber();
    if (lastIndex === words.length) {
      console.log("Already populated.");
      return;
    }

    console.log(`Start from ${lastIndex}`);

    while (lastIndex < words.length) {
      const nextChunk = Math.min(chunkSize, words.length - lastIndex);
      console.log(`Adding...`);
      const chunk = words.slice(lastIndex, lastIndex + nextChunk);
      const tx = await decentWordsContract.addWords(chunk);
      await tx.wait(3);
      lastIndex += nextChunk;
      console.log(`Next index ${lastIndex}`);
    }
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
    {},
    decentWordsContract.address,
    decentPoemsRendererContract.address,
    process.env.SPLIT_ADDRESS,
    7,
    process.env.VRF_COORDINATOR_ADDRESS,
    BigNumber.from(process.env.VRF_SUBSCRIPTION_ID),
    process.env.VRF_KEY_HASH
  );
});
