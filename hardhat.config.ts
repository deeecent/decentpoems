import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";

import "solidity-coverage";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-etherscan";

import("./tasks").catch((e) => console.log("Cannot load tasks", e.toString()));

const DEFAULT_KEY =
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY! || DEFAULT_KEY;
const MUMBAI_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY! || DEFAULT_KEY;
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY! || DEFAULT_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const CRONOSCAN_API_KEY = process.env.CRONOSCAN_API_KEY;
const COINMARKETCAP_KEY = process.env.COINMARKETCAP_KEY || "";
const TOKEN = process.env.TOKEN || "MATIC";
const GASPRICE_API = {
  MATIC: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
  ETH: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  CRO: `https://api.cronoscan.com/api?module=proxy&action=eth_gasPrice&apiKey=${CRONOSCAN_API_KEY}`,
}[TOKEN];
const GASREPORT_FILE = process.env.GASREPORT_FILE || "";
const NO_COLORS = process.env.NO_COLORS == "false" || GASREPORT_FILE != "";
const GAS_PRICE = process.env.GAS_PRICE
  ? (process.env.GAS_PRICE as unknown as number)
  : undefined;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.15",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [MUMBAI_PRIVATE_KEY],
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: [POLYGON_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: "EUR",
    coinmarketcap: COINMARKETCAP_KEY,
    enabled: process.env.REPORT_GAS ? true : false,
    gasPriceApi: GASPRICE_API,
    token: TOKEN,
    gasPrice: GAS_PRICE,
    outputFile: GASREPORT_FILE,
    noColors: NO_COLORS,
  },
  typechain: {
    outDir: "./typechain",
  },
  mocha: {
    timeout: 100000000,
  },
};

export default config;
