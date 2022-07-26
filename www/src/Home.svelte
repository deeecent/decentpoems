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
    <Column>
      <h4>Oldest Auction</h4>
      <Auction {poem} />
    </Column>
    <Column>
      <h4>Last Minted</h4>
      <Minted {poem} />
    </Column>
  </Row>
</Grid>

<style>
  .separator {
    width: 100%;
    border-top: 1px;
    border-color: black;
    border-style: dashed;
  }
</style>
