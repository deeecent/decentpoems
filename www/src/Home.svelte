<script lang="ts">
  import {
    currentPoem,
    currentWord,
    decentPoems,
    auctions,
    minted,
    decentPoemsReadOnly,
  } from "./stores/contract";

  import AuctionList from "./AuctionList.svelte";
  import CurrentPoem from "./CurrentPoem.svelte";
  import MintedList from "./MintedList.svelte";
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
        wordIndex={$currentWord.index}
        contract={$decentPoems}
      />
    </section>
  {/if}
</div>

<div class="auctions">
  <section class="intro">
    <p>
      Every time a <strong>Decent Poem</strong> is completed, it is sold in a
      <em>Dutch auction</em>. If the auction succeedes, a new NFT is minted and
      the preceedings are split to the authors. Authors will also get revenues
      on secondary sales.
    </p>
  </section>

  {#if $decentPoemsReadOnly && $auctions}
    {#if $auctions.length}
      <AuctionList
        auctions={$auctions}
        decentPoemsReadOnly={$decentPoemsReadOnly}
      />
    {:else}
      <section class="intro">There are no auctions at the moment.</section>
    {/if}
  {/if}
</div>

<div class="minted">
  {#if $minted && $minted.length}
    <section class="intro">
      <p>
        Every time a <strong>Decent Poem</strong> is completed, it is sold in a
        <em>Dutch auction</em>. If the auction succeedes, a new NFT is minted
        and the preceedings are split to the authors. Authors will also get
        revenues on secondary sales.
      </p>
    </section>
    <MintedList poems={$minted} />
  {/if}
</div>

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

  .main,
  .minted,
  .auctions {
    padding: 0 0 10rem 0;
  }

  .auctions {
    background: linear-gradient(
      180deg,
      rgba(188, 72, 255, 0) 0%,
      rgba(188, 72, 255, 0.1) 35%,
      rgba(96, 86, 104, 0.2) 75%,
      rgba(188, 72, 255, 0) 100%
    );
  }

  .minted {
    background: linear-gradient(
      180deg,
      rgba(188, 72, 255, 0.1) 0%,
      rgba(188, 72, 255, 0) 0%,
      rgba(96, 86, 104, 0.2) 75%,
      rgba(188, 72, 255, 0) 100%
    );
  }

  p {
    font-size: 1.2rem;
    font-family: var(--serif);
  }

  p strong {
    font-family: var(--sans-serif);
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
