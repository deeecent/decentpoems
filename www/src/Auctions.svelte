<script lang="ts">
  import { Grid, Column, Row } from "carbon-components-svelte";
  import type { DecentPoems } from "../../typechain";
  import Auction from "./Auction.svelte";
  import type { PoemAuction } from "./types";

  export let decentPoems: DecentPoems;
  export let auctions: PoemAuction[];
</script>

<Grid padding>
  {#each auctions as auction}
    <Row>
      <Column><Auction {auction} decentPoemsReadOnly={decentPoems} /></Column>
    </Row>
  {/each}
</Grid>
