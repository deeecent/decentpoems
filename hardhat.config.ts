import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";

import("./tasks").catch((e) => console.log("Cannot load tasks", e.toString()));

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const RINKEBY_PRIVATE_KEY =
  process.env.RINKEBY_PRIVATE_KEY! ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key
const KOVAN_PRIVATE_KEY =
  process.env.KOVAN_PRIVATE_KEY! ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_KEY = process.env.COINMARKETCAP_KEY || "";
const TOKEN = process.env.TOKEN || "MATIC";
const GASPRICE_API = {
  MATIC: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
  ETH: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
}[TOKEN];
const GAS_PRICE = process.env.GAS_PRICE
  ? (process.env.GAS_PRICE as unknown as number)
  : undefined;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.14",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {},
    localhost: {},
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [KOVAN_PRIVATE_KEY],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: "EUR",
    coinmarketcap: COINMARKETCAP_KEY,
    enabled: process.env.REPORT_GAS ? true : false,
    gasPriceApi: GASPRICE_API,
    token: TOKEN,
    gasPrice: GAS_PRICE,
  },
  typechain: {
    outDir: "./typechain",
  },
};

export default config;
