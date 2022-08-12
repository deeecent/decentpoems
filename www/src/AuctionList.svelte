<script lang="ts">
  import type { DecentPoems } from "../../typechain";
  import Auction from "./Auction.svelte";
  import type { PoemAuction } from "./types";

  export let decentPoemsReadOnly: DecentPoems;
  export let auctions: PoemAuction[];
</script>

<section>
  {#each auctions as auction}
    <div>
      <Auction {auction} {decentPoemsReadOnly} />
    </div>
  {/each}
</section>

<style>
  section {
    max-width: 75rem;
  }

  div:not(:last-child) {
    margin: 0 auto;
    margin-bottom: 10rem;
  }
</style>
