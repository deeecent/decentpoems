<script lang="ts">
  import { Route } from "tinro";
  import { init } from "./stores/wallet";

  import Home from "./Home.svelte";
  import Auctions from "./Auctions.svelte";
  import MintedList from "./MintedList.svelte";
  import NetworkError from "./NetworkError.svelte";
  import Debug from "./Debug.svelte";

  const initializing = init();
</script>

{#await initializing}
  <p>Loading please wait…</p>
{:then}
  <NetworkError />
  <Route path="/">
    <Home />
  </Route>
  <Route path="/auctions">
    <Auctions />
  </Route>
  <Route path="/minted"><MintedList /></Route>
  <Route path="/__debug">
    <Debug />
  </Route>
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
