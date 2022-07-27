<script lang="ts">
  import { Header, HeaderNav, HeaderNavItem } from "carbon-components-svelte";
  import { signer, connect, disconnect, shortAddress } from "./stores/wallet";
</script>

<Header>
  <HeaderNav>
    <HeaderNavItem href="/" text="Home" />
    <HeaderNavItem href="/auctions" text="Auctions" />
    <HeaderNavItem href="/minted" text="Minted" />
    <HeaderNavItem href="/about" text="About" />
    {#if $signer}
      <HeaderNavItem
        class="wallet"
        on:click={disconnect}
        href="#"
        text={`Disconnect ${$shortAddress}`}
      />
    {:else}
      <HeaderNavItem
        class="wallet"
        on:click={connect}
        href="#"
        text="Connect Wallet"
      />
    {/if}
  </HeaderNav>
</Header>
