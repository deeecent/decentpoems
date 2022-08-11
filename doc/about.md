## Inspiration

"Let's put the whole English dictionary on blockchain", said no-one ever. Actually, one of us said that, and after some weeks of development during the hottest days of summer, we are happy to announce our project: Decent Poems!

We are DEEECENT, two freelance blockchain devs in love with games that challenge people to cooperate and (sometimes) compete. We also love art and NFTs.
With the chance to build something on a platform like Polygon, we thought it would have been nice to leverage the low fees of the blockchain to create an interactive, collaborative app, with a "web3" flavour.
We initially tried to think if we could turn one of the many board or card games into a Dapp, but nothing really exciting came to our mind.
We thought about the many existing word games (wordle, scrabble etc.), which are usually very fun and entertaining, but we didn't won't to just "migrate" a game into web3.

At the same time, we realized how tiny the world of digital written art is: there are NFTs about music, images, videos... but very few about text.

So, why not storing the whole English dictionary* on-chain and use it to stimulate people creativity?

> Decent Poems /ˈdē-sᵊnt ˈpō-əms/ noun 1 a protocol for collective writing 2 a coordination experiment 3 on–chain NFT poems. 

*Not exactly all of it.

## What it does

Decent Poems is a Dapp that allows people over the internet to write poems. In Decent Poems, a poem has a title and six verses. Everyone can participate, but there are few rules to spice up things a bit:

- Your verse must include what we call **current word**.
- The **current word** is updated every time someone submits a verse.
- If multiple people submit a valid verse, only the first one is stored, the other ones are discarded.
- After submitting the sixth verse, the poem is finalized and it is sold in a Dutch auction.
- When the poem is sold, it's minted as an NFT and authors that contributed will receive a part of the preceedings (this is true for secondary sales as well).
- If the poem is not sold, it is lost forever.

Everything is handled by our Smart Contract, 100% on chain, based on Polygon. So the system could live *forever*.

### Poetic explanation

> *The contract draws a word, just a word<br/>*
> *Anon sees it, writes a verse that on the ledger is stored<br/><br/>*
> *The contract draws a new word, not looking for sense<br/>*
> *Someone else takes it from there and writes another verse<br/><br/>*
> *5 more times we go on this tone<br/>*
> *5 more verses join the poem<br/><br/>*
> *Will it be short or long, good or bad?<br/>*
> *Only the harmony of the writers can tell<br/><br/>*
> *Now a poem has come to life. Where will it go? Who will see it?<br/>*
> *A dutch auction is started. Will someone come and buy it?<br/><br/>*
> *If a degen presses the button and signs the transaction,<br/>*
> *A new NFT is added to the Decent Poems collection<br/><br/>*
> *A new piece of creativity flows in the OpenSeas<br/>*
> *And all of its authors will enjoy its proceeds*


## How we built it

Thanks to Polygon, we managed to squeeze all features on-chain, effectively creating a fully decentralized application (including the SVG and metadata of the NFT-Poems :D).

We could then interact with some pretty cool components that came to the ecosystem:

- We included Chainlink VRF to generate the random words after each submission
- We added support for the Sequence wallet
- Last, but not least, we used the great 0xSplit protocol to create the splits for the authors. Every time an NFT is minted, a split is created and the authors will be able (from the 0xSplit dashboard) to distribute the earnings among each others.

In a nutshell: OUR BACKEND IS POLYGON!

## Challenges we ran into

1. Words. We needed to find a good dictionary of words that were not to specific, so to allow the authors to express their creativity with simplicity.
2. Words, on-chain. We had to save the whole dictionary on Polygon. We have tried multiple optimization techniques (from storing uint rather than string to ad-hoc array storing procedures). You know what? On Polygon everything is so cheap that the difference was not really noticeable. So we decided to go for clarity rather than for extreme optimization.
3. Chainlink VRF: the integration was a bit bumpy, as for some reason we were not receiving randomness from the VRF Coordinator. Everything was fixed after recreating the subscription.
4. 0xSplit interaction: the integration was a bit more than bumpy. The 0xSplit `createSplit` function has quite some demands that required a bit of coding golf to fulfill (unique wallets, sorted by ascending orders, exact 100% sum etc)
5. Mobile wallet integration: without manually setting a specific rpc endpoint on WalletConnect, mobile transactions would fail due to wrong gas estimates. We have encountered this problem only on Polygon so far.


## Accomplishments that we're proud of

We asked some friends to play with our dapp. Some of them never used a web3 dapp before, and other than telling them to install a wallet and give them 1 MATIC, they immediately understood the UI and the project itself. They started racing trying to be the first to submit the verse, and they created three beautiful poems! Some of the comments we received:

- I feel the pressure of poetry
- I really like the UI!
- OMG It's like speed chess but poetry

Doing UI/UX for web3 is not trivial, and while we are not designers we ended up doing something... decent. (After so many years in the industry we probably learned something). Anyway, our blockchain "newbies" didn't have any trouble playing with decentpoems.art! 

We also are very proud of building a system that puts creators first, both in the primary and secondary sales. Polygon allows us also to be more inclusive: given the low gas fees anyone can participate!

## What we learned

We learned that the word "dilettante" is not only an italian word, but also an english one with the exact same meaning (although we don't know exactly how to pronounce it). Apart from that by keeping things simple we can make our concept easier to understand and funnier to use.

## What's next for Decent Poems

Within the vision of Decent Poems, we will add a few more features to make the UX of the website nicer and provide a Twitter bot to keep the people informed about the newly created poems/sales.

Talking about the future, Decent Poems is just the first implementation of a concept that goes beyond poems. We want to create protocols that incentivize creative people to express themselves and help them earning with their skills.