## ![Test workflow](https://github.com/vrde/hyperpoem/actions/workflows/node.yml/badge.svg)

![Logo](https://github.com/deeecent/decentpoems/blob/main/doc/logo.github.alpha.svg?raw=true)

# Definition

**Decent Poems** /ˈdē-sᵊnt ˈpō-əms/ noun

1. a protocol for collective writing
2. a coordination experiment
3. on-chain NFT poems

# What (is it)

Decent Poems is an experiment for coordination and collective writing.

The rules are quite simple:

- Everyone on the website sees a random word (drawn from a list of 25320, same for everyone).
- The first one to write a verse which includes such word wins the round and their verse is added to the poem.
- Once 6 verses (+ title) have been signed into the blockchain, a poem is generated.

The poem immediately goes into a Dutch Auction which will allow anyone who likes it to buy it.
This will generate an NFT that can then be traded.

Cherry on top: all the revenue (from minting and from the trades royalties) are equally split among the authors, by means o 0xSplit.

Everything is handled by our Smart Contract, 100% on chain, based on Polygon. So the system could live _forever_.

Try it out at [https://www.decentpoems.art](https://www.decentpoems.art) !

## Technical Details

- In order to generate the random word, the contract interacts with the VRF from Chainlink. (As a fallback, it's possible to switch to a blockhash based word generation.)
- The dapp supports the Sequence wallet.
- The dapp on IPFS as well, using NFT Storage. This makes sure that our content is permanently pinned and available through the Filecoin network.
- The dapp is accessible via [IPNS](https://decentpoems-art.ipns.dweb.link/). We set our DNS records according to the DNSLink specifications.

---

Each minted poem has a 0xSplit address that the authors can use to distribute their revenue from the trades of the NFT.

# Why (we did it)

It all started when we wanted to join the [Polygon BUIDLIT Hackaton](https://buidlit.polygon.technology/).

Given the great-many opportunities that Polygon offers given its low gas fees, we decided to build something a bit more visionary than we would do with our usual Ethereum NFTs.

Also: there isn't much around the NFT world about text and literature, so why not taking the chance?

# How (to work on it)

## Smart Contract

### Requirements

- npm
- npx
- hardhat
- .env file (look at [env_sample](https://github.com/deeecent/decentpoems/blob/main/env_sample))

### Setup

```
npm i
```

### Compile

`npx hardhat compile`

### Test

`npx hardhat test`

### Deploy

```
npx hardhat deploy-words --network <polygon|mumbai>
npx hardhat deploy-renderer --network <polygon|mumbai>
npx hardhat deploy-poems --network <polygon|mumbai>
```

`deploy-poems` should be the last one

### Populate dictionary

`npx hardhat populate --words-file <words file> --network <polygon|mumbai>`

### Others

There other commands you can use to interact with the contract

- create-poem
- set-vrf
- set-auction
- mint
- word
- auctions
- reset-seed

Most of them are for testing purpose. Check `tasks/admin.ts` for details.

## Website

### Tech stack

- Svelte
- Vite
- Ethers
- 0xsequence
- WalletConnect

### Setup

```
cd www
pnpm i
```

### Run local server

```
cd www
pnpm dev
```

### Deploy

```
cd www
pnpm deploy-production
```

# Who (we are)

- Alberto
  - [Github](https://github.com/vrde)
  - [Web](https://www.granzotto.net)
- Nicola
  - [Github](https://github.com/sirnicolaz)
  - [Linktree](https://linktr.ee/innrspce)
