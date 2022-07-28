import { ContractFactory } from "ethers";
import { readFile, writeFile } from "fs/promises";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DecentPoems__factory,
  DecentWords__factory,
  factories,
} from "../typechain";

const CONFIG_FILE_PATH = "./artifacts/network.json";

const FACTORIES: Record<string, any> = {
  DecentWords: DecentWords__factory,
  DecentPoems: DecentPoems__factory,
};

export async function storeContractAddress(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  address: string,
  configPath: string = CONFIG_FILE_PATH
) {
  const networks: any = JSON.parse(await readFile(configPath, "utf8"));
  const { chainId } = await hre.ethers.provider.getNetwork();
  const addresses = networks[chainId];
  addresses[contractName] = address;

  await writeFile(configPath, JSON.stringify(networks, null, 2));

  console.log(`Address ${address} stored for ${contractName} at ${configPath}`);
}

export async function deployContract(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  ...args: any[]
) {
  const factory = await hre.ethers.getContractFactory(contractName);
  const contract = await factory.deploy(...args);
  await contract.deployed();

  await storeContractAddress(hre, contractName, contract.address);

  return contract;
}

export async function loadContract(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  configPath: string = CONFIG_FILE_PATH
) {
  const networks: any = JSON.parse(await readFile(configPath, "utf8"));
  const [deployer] = await hre.ethers.getSigners();
  const { chainId } = await hre.ethers.provider.getNetwork();
  const addresses = networks[chainId];

  let contract;
  if (contractName in addresses) {
    const address = addresses[contractName];
    contract = FACTORIES[contractName].connect(address, deployer);
  }

  return contract;
}
