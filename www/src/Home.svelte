<script lang="ts">
  import {
    currentPoem,
    currentWord,
    decentPoems,
    auctions,
    minted,
    decentPoemsReadOnly,
  } from "./stores/contract";

  import Auction from "./Auction.svelte";
  import CurrentPoem from "./CurrentPoem.svelte";
  import Minted from "./Minted.svelte";
</script>

<div class="main">
  <section class="intro">
    <p>
      <strong>Decent Poems</strong> /ˈdē-sᵊnt ˈpō-əms/ <em>noun</em>
      <strong>1</strong> a protocol for collective writing
      <strong>2</strong>
      a coordination experiment <strong>3</strong> a royalty distribution system.
    </p>
  </section>

  {#if $currentPoem && $currentWord}
    <section class="poem">
      <CurrentPoem
        poem={$currentPoem}
        word={$currentWord.word}
        wordIndex={$currentWord.index.toNumber()}
        contract={$decentPoems}
      />
    </section>
  {/if}
</div>

{#if $decentPoemsReadOnly && $auctions && $auctions.length}
  <h4>Last Auction</h4>
  <Auction auction={$auctions[0]} decentPoemsReadOnly={$decentPoemsReadOnly} />
{/if}
{#if $minted && $minted.length}
  <h4>Last Minted</h4>
  <Minted poem={$minted[0]} />
{/if}

<style>
  .main {
    display: flex;
    padding: 1rem;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    min-height: 100vh;
  }

  .intro {
    margin-top: 4rem;
    margin-bottom: 4rem;
    max-width: 35rem;
    align-self: flex-start;
  }

  p {
    font-size: 1.2rem;
    font-family: var(--serif);
  }

  p strong {
    font-family: sans-serif;
  }

  /* Inspired by https://codepen.io/dalper02/pen/VLeVjP */
  .poem {
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    min-height: 300px;
    padding: 0;
    position: relative;
  }

  .poem:before,
  .poem:after {
    content: "";
    height: 98%;
    position: absolute;
    width: 100%;
    z-index: -1;
  }

  .poem:before {
    background: #fafafa;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    left: -5px;
    top: 4px;
    transform: rotate(-2.5deg);
  }

  .poem:after {
    background: #f6f6f6;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
    right: -3px;
    top: 1px;
    transform: rotate(1.4deg);
  }
</style>
