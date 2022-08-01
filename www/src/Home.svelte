<script lang="ts">
  import {
    currentPoem,
    currentWord,
    decentPoems,
    auctions,
  } from "./stores/contract";

  import { Grid, Column, Row } from "carbon-components-svelte";
  import Auction from "./Auction.svelte";
  import CurrentPoem from "./CurrentPoem.svelte";
  import Minted from "./Minted.svelte";
</script>

{#if $currentPoem && $currentWord}
  <Grid padding>
    <Row>
      <Column>
        <CurrentPoem
          poem={$currentPoem}
          word={$currentWord.word}
          wordIndex={$currentWord.index.toNumber()}
          contract={$decentPoems}
        />
      </Column>
    </Row>
    <Row>
      <div class="separator" />
    </Row>
    <Row>
      <Column>
        <h4>Last Auction</h4>
        {#if $auctions.length}
          <Auction poem={$auctions[0]} />
        {/if}
      </Column>
      <Column>
        <h4>Last Minted</h4>
      </Column>
    </Row>
  </Grid>
{/if}

<style>
  .separator {
    width: 100%;
    border-top: 1px;
    border-color: black;
    border-style: dashed;
  }
</style>
