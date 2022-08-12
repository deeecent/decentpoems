<script lang="ts">
  import { Route } from "tinro";
  import { init } from "./stores/wallet";

  import Home from "./Home.svelte";
  import FAQ from "./FAQ.svelte";
  import Debug from "./Debug.svelte";
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import Error from "./Error.svelte";

  const initializing = init();
</script>

<Route>
  {#await initializing}
    <p>Loading please wait…</p>
  {:then}
    <Error />
    <Header />
    <Route path="/">
      <Home />
    </Route>
    <Route path="/faq">
      <FAQ />
    </Route>
    <Route path="/__debug">
      <Debug />
    </Route>
    <Footer />
  {:catch}
    <p>There was an error loading the page.</p>
  {/await}
</Route>

<style>
  p {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
  }
</style>
