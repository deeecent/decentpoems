import { task } from "hardhat/config";
import { DecentPoemsRenderer, DecentWords } from "../typechain";
import { readFileSync } from "fs";
import { loadContract, deployContract } from "./utils";

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

    const wordsPerChunk = 834;
    let lastIndex = (await decentWordsContract.total()).toNumber();
    if (lastIndex === words.length) {
      console.log("Already populated.");
      return;
    }

    console.log(`Populating from ${lastIndex}`);

    while (lastIndex < words.length) {
      const chunk = words.slice(lastIndex, lastIndex + wordsPerChunk);
      const tx = await decentWordsContract.addWords(chunk);
      await tx.wait(1);

      lastIndex = Math.min(lastIndex + wordsPerChunk, words.length);
      console.log(`Next starting index ${lastIndex}`);
    }
  });

task("deploy-words", "Deploy DecentWords").setAction(async (_, hre) => {
  console.log("Deploy contract DecentWords");
  await deployContract(hre, "DecentWords");
});

task("deploy-renderer", "Deploy DecentPoemsRenderer").setAction(
  async (_, hre) => {
    console.log("Deploy contract DecentWords");
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
  await deployContract(
    hre,
    "DecentPoems",
    { DecentPoemsRenderer: decentPoemsRendererContract.address },
    decentWordsContract.address,
    process.env.SPLIT_ADDRESS,
    7
  );
});
