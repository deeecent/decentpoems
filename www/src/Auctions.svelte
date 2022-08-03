<script lang="ts">
  import type { DecentPoems } from "../../typechain";
  import Auction from "./Auction.svelte";
  import type { PoemAuction } from "./types";

  export let decentPoems: DecentPoems;
  export let auctions: PoemAuction[];
</script>

{#each auctions as auction}
  <Auction {auction} decentPoemsReadOnly={decentPoems} />
{/each}
