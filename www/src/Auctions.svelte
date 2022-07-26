<script lang="ts">
  import { poem } from "./types";
  import { Grid, Column, Row } from "carbon-components-svelte";
  import Auction from "./Auction.svelte";

  export let poems = [poem, poem, poem];
</script>

<Grid padding>
  {#each poems as poem}
    <Row>
      <Column><Auction {poem} /></Column>
    </Row>
  {/each}
</Grid>
