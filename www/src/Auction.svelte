<script lang="ts">
  import { Button } from "carbon-components-svelte";
  import { formatEther } from "ethers/lib/utils";
  import { onMount } from "svelte";
  import type { DecentPoems } from "../../typechain";
  import type { PoemAuction } from "./types";
  import { address, connect } from "./stores/wallet";
  import { decentPoems } from "./stores/contract";

  export let auction: PoemAuction;
  export let decentPoemsReadOnly: DecentPoems;

  const authors = Array.from(
    new Set([auction.title.author, ...auction.verses.map((v) => v.author)])
  );

  let price = formatEther(auction.price);
  let pending = false;

  onMount(() => {
    const timerId = window.setInterval(async () => {
      const newPrice = await decentPoemsReadOnly.getCurrentPrice(auction.id);
      console.log("check price", newPrice);
      price = formatEther(newPrice);
    }, 10000);
    return () => window.clearInterval(timerId);
  });

  async function mint(decentPoems: DecentPoems, address: string, id: number) {
    const price = await decentPoems.getCurrentPrice(id);
    await decentPoems.safeMint(address, id, { value: price });
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

<p>Time left: 12h 45m 21s</p>
<h3>{auction.title.text}</h3>
<img src={auction.metadata.image} />
<div>
  Authors: {authors.join(", ")}
</div>

<Button on:click={onMint}>Mint for {price} Eth</Button>
