<script lang="ts">
  import { onMount } from "svelte";
  import type { DecentPoems } from "../../typechain";
  import type { PoemAuction } from "./types";
  import { address, connect } from "./stores/wallet";
  import { decentPoems } from "./stores/contract";
  import { formatEther, secondsToHms, shortAddress } from "./utils";

  export let auction: PoemAuction;
  export let decentPoemsReadOnly: DecentPoems;

  const authors = Array.from(
    new Set([auction.title.author, ...auction.verses.map((v) => v.author)])
  );

  let price = formatEther(auction.price);
  let pending = false;
  let priceTimerId: number;
  let secondsTimerId: number;
  let secondsLeft = (auction.validUntil.getTime() - Date.now()) / 1000;

  onMount(() => {
    priceTimerId = window.setInterval(async () => {
      const newPrice = await decentPoemsReadOnly.getCurrentPrice(auction.id);
      console.log("check price", newPrice);
      price = formatEther(newPrice);
    }, 10000);

    secondsTimerId = window.setInterval(() => {
      secondsLeft = (auction.validUntil.getTime() - Date.now()) / 1000;
    }, 1000);
    return () =>
      [priceTimerId, secondsTimerId].forEach((timerId) =>
        window.clearInterval(timerId)
      );
  });

  async function mint(decentPoems: DecentPoems, address: string, id: number) {
    const price = await decentPoems.getCurrentPrice(id);
    try {
      await decentPoems.safeMint(address, id, { value: price });
    } catch (e) {
      console.error(e);
    }
    return () =>
      [priceTimerId, secondsTimerId].forEach((timerId) =>
        window.clearInterval(timerId)
      );
  }

  async function onMint() {
    if ($decentPoems && $address) {
      await mint($decentPoems, $address, auction.id);
    } else {
      try {
        await connect();
        pending = true;
      } catch (e) {
        console.error(e);
      }
    }
  }

  $: {
    if (pending && $decentPoems && $address) {
      pending = false;
      mint($decentPoems, $address, auction.id);
    }
  }
</script>

<div class="auction">
  <div class="nft-container">
    <div class="nft">
      <p class="time-left">Auction ends in {secondsToHms(secondsLeft)}</p>
      <img src={auction.metadata.image} />
      <button on:click={onMint}>Mint for {price} MATIC</button>
    </div>
  </div>

  <div class="panel">
    <div class="poem">
      <h1>{auction.title.text}</h1>
      {#each auction.verses as { author, text }}
        <p>{text}</p>
      {/each}
      <div class="authors">
        Authors: {authors.map(shortAddress).join(", ")}
      </div>
    </div>
  </div>
</div>

<style>
  .auction {
    padding: 2rem;
    display: flex;
    width: 100%;
    justify-content: space-around;
    align-items: center;
  }

  .auction > * {
    flex: 1;
  }

  .panel {
    border: 1px solid rgb(136, 136, 136, 0.1);
    padding: 5rem 2rem;
    border-radius: 0.25rem;
    background-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 1rem 1.5rem rgba(0, 0, 0, 0.2);
    width: 100%;
  }

  .authors {
    margin-top: 4rem;
  }

  .nft {
    width: 70%;
    margin: 0 auto;
  }

  .nft p {
    text-align: center;
  }

  h1 {
    margin: 0;
  }

  .time-left {
    font-family: var(--sans-serif);
    font-weight: bold;
  }

  img {
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.5);
    max-width: 30rem;
    border-radius: 0.25rem;
    width: 100%;
  }

  button {
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.2);
    width: 80%;
    margin-bottom: 2rem;
  }

  button:hover {
    box-shadow: 0 0.5rem 1.5rem 0.1rem rgba(0, 0, 0, 0.5);
  }

  @media (max-width: 900px) {
    .auction {
      flex-direction: column;
    }

    .nft {
      width: 100%;
    }

    button {
      width: 100%;
    }
  }
</style>
