import { task } from "hardhat/config";
import { readFile, writeFile } from "fs/promises";
import {
  DecentPoems,
  DecentPoems__factory,
  DecentWords,
  DecentWords__factory,
} from "../typechain";
import { readFileSync } from "fs";
import { loadContract, deployContract } from "./utils";

task("populate", "Deploy Decent Words")
  .addParam("wordsFile")
  .setAction(async ({ wordsFile }, hre) => {
    const words = readFileSync(wordsFile, "utf-8").split("\n");
    const decentWordsContract = (await loadContract(
      hre,
      "DecentWords"
    )) as DecentWords;

    if (decentWordsContract === undefined) {
      console.error("Contract nod deployed yet.");
      return;
    }

    const bytesPerChunk = 2000;
    let lastIndex = 0;

    while (lastIndex < words.length) {
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

task("deploy-words", "Deploy DecentPoems").setAction(async (_, hre) => {
  console.log("Deploy contract DecentWords");
  await deployContract(hre, "DecentWords");
});

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

  console.log("Deploy contract DecentPoems");
  await deployContract(hre, "DecentPoems", decentWordsContract.address, 7);
});
