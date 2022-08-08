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
  <div class="nft-container">
    <div class="nft">
      <p class="time-left">Auction ends in {secondsToHms(secondsLeft)}</p>
      <img
        src={auction.metadata.image}
        alt="A poem with title: {auction.title.text}"
      />
      <button on:click={onMint}>Mint for {price} MATIC</button>
    </div>
  </div>
</div>

<style>
  .auction {
    display: flex;
    width: 100%;
    justify-content: space-around;
    align-items: stretch;
    border: 1px solid rgb(136, 136, 136, 0.1);
    background-color: rgba(255, 255, 255, 0.295);
    box-shadow: 0 0.5rem 2rem 1rem rgba(0, 0, 0, 0.1);
    border-radius: 1rem;
  }

  .auction > * {
    flex: 1;
  }

  .poem {
    padding: 2rem 2rem;
    background-color: #f3f3f3;
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
    box-shadow: 2rem 0 2rem rgba(0, 0, 0, 0.1);
  }

  .panel {
    width: 100%;
  }

  .authors {
    margin-top: 4rem;
  }

  .nft-container {
    border-left: 1px dashed rgba(200, 200, 200, 0.295);
    border-top-right-radius: 1rem;
    border-bottom-right-radius: 1rem;
    background-color: #f3f3f380;
    padding: 2rem;
  }

  .nft {
    margin: 2rem auto;
    position: sticky;
    top: 2rem;
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
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.2);
    max-width: 30rem;
    border-radius: 0.25rem;
    width: 100%;
    display: block;
    margin: 4rem auto;
  }

  button {
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.2);
    margin: 0 auto;
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

    .nft-container {
      border-top-right-radius: 0;
      border-bottom-right-radius: 1rem;
      border-bottom-left-radius: 1rem;
      border-top-left-radius: 0;
    }

    .poem {
      border-top-right-radius: 1rem;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      border-top-left-radius: 1rem;
    }
  }
</style>
