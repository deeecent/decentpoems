<script lang="ts">
  import { currentPoem, currentWord, decentPoems } from "./stores/contract";

  import { Grid, Column, Row } from "carbon-components-svelte";
  import Auction from "./Auction.svelte";
  import CurrentPoem from "./CurrentPoem.svelte";
  import Minted from "./Minted.svelte";
  import { poem } from "./types";
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
        <h4>Oldest Auction</h4>
        <Auction {poem} />
      </Column>
      <Column>
        <h4>Last Minted</h4>
        <Minted {poem} />
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
