<script lang="ts">
  import Compose from "./Compose.svelte";
  import Header from "./Header.svelte";
  import { Route } from "tinro";
  import { init } from "./stores/wallet";

  const initializing = init();
</script>

{#await initializing}
  <p>Loading please wait…</p>
{:then}
  <header>
    <Header />
  </header>
  <Route path="/">
    <main>HyperPoem</main>
  </Route>
  <Compose />
{:catch}
  <p>There was an error loading the page.</p>
{/await}

<style>
  main {
    max-width: 1024px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  p {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
  }
</style>
