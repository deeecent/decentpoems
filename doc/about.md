## Inspiration

Card games where everyone collaborates to a commmon goal.

## What it does

> The contract generates a word, just a word.
> Anon sees it, writes a verse that on the ledger is stored.

> The contract generates a new word, not looking for sense.
> Someone else takes it and writes another sentence.

> 5 more times we go on this tone.
> 5 more sentences joins the poem.

> Will it be short or long, good or bad?
> Only the harmony of the writers can tell.

Now a poem has come to life. Where will it go? Who will see it?
A dutch auction is started. Will someone come and buy it?

If a degen presses the button and signs the transaction,
A new NFT is added to the Decent Poems collection.

A new piece of creativity flows in the OpenSeas
And all of its authors will enjoy its proceeds.

## How we built it

Thanks to Polygon, we managed to squeeze all features on-chain, effectively creating a fully decentralized application (including the SVG and metadata of the NFT-Poems :D).

We could then interact with some pretty cool components that came to the ecosystem:

- we included Chainlink VRF to generate the random words after each submission
- we hosted the dapp on IPFS
- last, but not least, we used the great 0xSplit protocol to create the splits for the authors. Every time an NFT is minted, a split is created and the authors will be able (from the 0xSplit dashboard) to distribute the earnings among each others.

In a nutshell: OUR BACKEND IS POLYGON!

## Challenges we ran into

1. Words. We needed to find a good dictionary of words that were not to specific, so to allow the authors to express their creativity with simplicity.
2. Words, on-chain. We had to save the whole dictionary on Polygon. We have tried multiple optimization techniques (from storing uint rather than string to ad-hoc array storing procedures). You know what? On Polygon everything is so cheap that the difference was not really noticeable. So we decided to go for clarity rather than for extreme optimization.
3. Chainlink VRF: the integration was a bit bumpy, as for some reason we were not receiving randomness from the VRF Coordinator. Everything was fixed after recreating the subscription.
4. 0xSplit interaction: the integration was a bit more than bumpy. The 0xSplit `createSplit` function has quite some demands that required a bit of coding golf to fulfill (unique wallets, sorted by ascending orders, exact 100% sum etc)

## Accomplishments that we're proud of

First of all, the website looks really neat. We achieved the "academy" feeling we wanted to convery with this project.

We also are very proud of having built the system in a way that will allow it to reward its contributors in a completely decentralized, self-sustained fashion. 0xSplit played a foundamental role in this case.

## What we learned

We learned that the word "dilettante" is not only an italian word, but also an english one with the exact same meaning (although we would know exactly how to pronounce it).

## What's next for Decent Poems

Within the small vision of Decent Poems, we will probably add a few more features to make the UX of the website nicer and provide a Twitter bot to keep the people informed about the newly created poems/sales.

Talking about the bigger vision, Decent Poems is just the first implementation of a concept that goes beyond poems. We want to create protocols that incentivise creative people to express themselves and help them earning with their skills.
