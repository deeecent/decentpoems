<script lang="ts">
  import Home from "./Home.svelte";
  import { Route } from "tinro";
  import { init } from "./stores/wallet";
  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    Content,
  } from "carbon-components-svelte";
  import Auctions from "./Auctions.svelte";
  import MintedList from "./MintedList.svelte";

  const initializing = init();
</script>

{#await initializing}
  <p>Loading please wait…</p>
{:then}
  <Header>
    <HeaderNav>
      <HeaderNavItem href="/" text="Home" />
      <HeaderNavItem href="/auctions" text="Auctions" />
      <HeaderNavItem href="/minted" text="Minted" />
      <HeaderNavItem href="/about" text="About" />
    </HeaderNav>
  </Header>
  <Content>
    <Route path="/">
      <Home />
    </Route>
    <Route path="/auctions">
      <Auctions />
    </Route>
    <Route path="/minted"><MintedList /></Route>
  </Content>
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
