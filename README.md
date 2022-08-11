## ![Test workflow](https://github.com/vrde/hyperpoem/actions/workflows/node.yml/badge.svg)

![Logo](https://github.com/deeecent/decentpoems/blob/main/doc/logo.github.alpha.svg?raw=true)

# Definition

**Decent Poems** /ˈdē-sᵊnt ˈpō-əms/ noun

1. a protocol for collective writing
2. a coordination experiment
3. a royalty distribution system

# What is it?

Decent Poems is a experiment for coordination and collective writing.

The rules are quite simple:

- Everyone on the website sees a random word (drawn from a list of 25320, same for everyone).
- The first one to write a verse which includes such word wins the round and their verse is added to the poem.
- Once 6 verses (+ title) have been signed into the blockchain, a poem is generated.

The poem immediately goes into a Dutch Auction which will allow anyone who likes it to buy it.
This will generate an NFT that can then be traded.

Cherry on the cake: all the revenue (from minting and from the trades royalties) are equally split among the authors, by means o 0xSplit.

Everything is handled by our Smart Contract, 100% on chain, based on Polygon. So the system could in principle live forever.

Try it out at [https://www.decentpoems.art](https://www.decentpoems.art) !

# Local Development

## Smart Contract

### Requirements

- hardhat
- .env file (look at `env_sample`)

### Compile

`npx hardhat compile`

### Testt

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
