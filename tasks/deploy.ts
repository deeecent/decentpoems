import { task } from "hardhat/config";
import { readFile, writeFile } from "fs/promises";
import { Renderer, Renderer__factory } from "../typechain";

task("deploy", "Deploy Storage", async (_, hre) => {
  console.log("Deploy contract Storage");
  const storageFactory = await hre.ethers.getContractFactory("Storage");

  const storageContract = await storageFactory.deploy();
  console.log("  Address", storageContract.address);
  const receipt = await storageContract.deployed();
  console.log("  Receipt", receipt.deployTransaction.hash);

  const { chainId } = await hre.ethers.provider.getNetwork();

  const config = {
    [chainId]: {
      Storage: storageContract.address,
    },
  };

  console.log("Configuration file in ./artifacts/network.json");
  await writeFile("./artifacts/network.json", JSON.stringify(config, null, 2));
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

task("get", "Deploy Test NFT", async (_, hre) => {
  const configPath = "./artifacts/network.json";
  const networks: any = JSON.parse(await readFile(configPath, "utf8"));
  const [deployer] = await hre.ethers.getSigners();
  const { chainId, name: networkName } = await hre.ethers.provider.getNetwork();
  const addresses = networks[chainId];
  const address = addresses["Renderer"]!;

  const contract = Renderer__factory.connect(address, deployer) as Renderer;
  console.log(await contract.tokenURI(1));
});
