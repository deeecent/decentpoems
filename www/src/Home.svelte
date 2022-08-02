<script lang="ts">
  import {
    currentPoem,
    currentWord,
    decentPoems,
    auctions,
    minted,
    decentPoemsReadOnly,
  } from "./stores/contract";

  import { Grid, Column, Row, Tile } from "carbon-components-svelte";
  import Auction from "./Auction.svelte";
  import CurrentPoem from "./CurrentPoem.svelte";
  import Minted from "./Minted.svelte";
</script>

{#if $currentPoem && $currentWord}
  <Grid padding>
    <Row>
      <Column>
        <Tile light>
          <p>
            <strong>Decent Poems</strong> /ˈdē-sᵊnt ˈpō-əms/ <em>noun</em>
            <strong>1</strong> a protocol for collective writing
            <strong>2</strong>
            a coordination experiment <strong>3</strong> a royalty distribution system.
          </p>
        </Tile>
      </Column>
    </Row>
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
        {#if $decentPoemsReadOnly && $auctions && $auctions.length}
          <Auction
            auction={$auctions[0]}
            decentPoemsReadOnly={$decentPoemsReadOnly}
          />
        {/if}
      </Column>
      <Column>
        {#if $minted && $minted.length}
          <h4>Last Minted</h4>
          <Minted poem={$minted[0]} />
        {/if}
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

  p {
    font-family: serif;
    font-size: 1.2rem;
  }

  p strong {
    font-family: sans-serif;
  }
</style>
