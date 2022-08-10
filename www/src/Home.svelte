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
  <section class="intro header">
    <img class="logo" src="./logo.png" alt="Decent Poems logo" />
    <p>
      <strong>Decent Poems</strong> /ˈdē-sᵊnt ˈpō-əms/ <em>noun</em>
      <strong>1</strong> a protocol for collective writing
      <strong>2</strong>
      a coordination experiment <strong>3</strong> a royalty distribution
      system.
      <br />
      <em class="know-more">
        Want to know more? Check our <a href="/faq">FAQs</a>
      </em>
    </p>
  </section>

  {#if $currentPoem && $currentWord}
    <section class="poem-wrapper">
      <div class="poem">
        <CurrentPoem
          poem={$currentPoem}
          word={$currentWord.word}
          wordIndex={$currentWord.index}
          contract={$decentPoems}
        />
      </div>
    </section>
  {/if}
</div>

<div class="auctions">
  <section class="intro">
    <h2>Auctions</h2>
    <p>
      Every time a <em>Decent Poem</em> is completed, it is sold in a
      <em>Dutch auction</em>. If the auction succeedes, a new NFT is minted and
      the <strong>preceedings are split to the authors</strong>, otherwise the
      poem is <strong>lost forever</strong>.
    </p>
  </section>

  {#if $decentPoemsReadOnly && $auctions}
    {#if $auctions.length}
      <AuctionList
        auctions={$auctions}
        decentPoemsReadOnly={$decentPoemsReadOnly}
      />
    {:else}
      <section class="empty">
        <p>
          There are no auctions at the moment. Make a poem to see a new auction
          here.
        </p>
      </section>
    {/if}
  {/if}
</div>

{#if $minted && $minted.length}
  <div class="minted">
    <section class="intro">
      <h2>Minted</h2>
      <p>
        Below you find all <em>Decent Poems</em> minted. Every NFT is stored
        <strong>on–chain</strong> and will exist as long as the blockchain keeps
        running. Authors get revenues on secondary sales via 0xsplits.xyz.
      </p>
    </section>
    <MintedList poems={$minted} />
  </div>
{/if}

<style>
  .main {
    display: flex;
    padding: 1rem;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    min-height: 80vh;
  }

  .know-more {
    font-size: 1rem;
  }

  .intro {
    margin-top: 4rem;
    margin-bottom: 4rem;
    max-width: 35rem;
    align-self: flex-start;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: var(--max-width);
  }

  .logo {
    width: 10rem;
  }

  @media (max-width: 900px) {
    .logo {
      width: 8rem;
    }
  }

  .header p {
    flex-grow: 1;
    max-width: 30rem;
  }

  h2 {
    font-size: 2rem;
  }

  .main,
  .minted,
  .auctions {
    padding: 0 0 5rem 0;
  }

  .auctions {
    background: linear-gradient(
      180deg,
      rgba(188, 72, 255, 0) 0%,
      rgba(188, 72, 255, 0.1) 35%,
      rgba(96, 86, 104, 0.1) 75%,
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

  .poem-wrapper {
    padding: 1rem;
  }

  /* Inspired by https://codepen.io/dalper02/pen/VLeVjP */
  .poem {
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    min-height: 300px;
    padding: 0rem;
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

  .empty {
    font-style: italic;
    text-align: center;
  }
</style>
