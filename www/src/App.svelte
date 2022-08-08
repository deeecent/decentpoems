<script lang="ts">
  import { Route } from "tinro";
  import { init } from "./stores/wallet";

  import Home from "./Home.svelte";
  import AuctionList from "./AuctionList.svelte";
  import MintedList from "./MintedList.svelte";
  import NetworkError from "./NetworkError.svelte";
  import Debug from "./Debug.svelte";
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";

  const initializing = init();
</script>

{#await initializing}
  <p>Loading please wait…</p>
{:then}
  <Header />
  <NetworkError />
  <Route path="/">
    <Home />
  </Route>
  <Route path="/auctions">
    <AuctionList />
  </Route>
  <Route path="/minted"><MintedList /></Route>
  <Route path="/__debug">
    <Debug />
  </Route>
  <Footer />
{:catch}
  <p>There was an error loading the page.</p>
{/await}

<style>
  p {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
  }
</style>
