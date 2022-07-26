import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import replace from "@rollup/plugin-replace";
import inject from "@rollup/plugin-inject";
import nodePolyfills from "rollup-plugin-polyfill-node";
import { createHtmlPlugin } from "vite-plugin-html";
import { readFileSync } from "fs";
import { plugin as mdPlugin, Mode } from "vite-plugin-markdown";

type ContractsAddresses = {
  [key: string]: string;
};

type Networks = {
  [key: string]: ContractsAddresses;
};

function getAddresses(chainId: string, dirs: string[]) {
  let networks = {} as Networks;
  for (let dir of dirs) {
    networks = {
      ...JSON.parse(readFileSync(dir, "utf8")),
    };
  }
  if (!networks[chainId]) {
    throw new Error(`Cannot find contracts for chainId ${chainId}`);
  }
  return networks[chainId];
}

// https://vitejs.dev/config/
export default async ({ mode }) => {
  //process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const env = loadEnv(mode, process.cwd(), [
    "BASE_",
    "VITE_",
    "HTML_",
    "SMART_CONTRACT_",
  ]);

  const smartContractPath = env?.SMART_CONTRACT_PATH;
  if (!smartContractPath) {
    console.error("Cannod find smart contract directory");
    process.exit(1);
  }

  const chainId = env.VITE_ETHEREUM_CHAIN_ID;
  const contractsAddresses = getAddresses(
    chainId,
    smartContractPath.split(";")
  );

  return defineConfig({
    base: "./",
    // Node.js global to browser globalThis
    define: {
      global: "globalThis",
    },
    plugins: [
      svelte(),
      replace({
        __VITE_CONTRACTS_ADDRESSES__: JSON.stringify(contractsAddresses),
      }),
      inject({
        util: "util/",
      }),
      createHtmlPlugin({
        inject: {
          data: {
            ...env,
          },
        },
      }),
      mdPlugin({ mode: [Mode.HTML] }),
    ],
    build: {
      rollupOptions: {
        plugins: [nodePolyfills()],
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis",
        },
        // Enable esbuild polyfill plugins
        plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
      },
      exclude: ["tinro"],
    },
  });
};
