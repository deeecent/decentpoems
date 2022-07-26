<script lang="ts">
  import { Grid, Column, Row } from "carbon-components-svelte";
  import Auction from "./Auction.svelte";
  import CurrentPoem from "./CurrentPoem.svelte";
  import Minted from "./Minted.svelte";
  import { poem } from "./types";
</script>

<Grid padding>
  <Row>
    <Column>
      <CurrentPoem />
    </Column>
  </Row>
  <Row>
    <div class="separator" />
  </Row>
  <Row>
    <Column><Auction {poem} /></Column>
    <Column><Minted {poem} /></Column>
  </Row>
</Grid>

<style>
  .separator {
    width: 100%;
    border-top: 2px;
    border-color: black;
    border-style: dashed;
  }
</style>
