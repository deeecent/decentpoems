<script lang="ts">
  import { signer, connect, disconnect, shortAddress } from "./stores/wallet";
  import { networkError } from "./stores/wallet";

  import { meta } from "tinro";
  const route = meta();
</script>

<header>
  <div class="wrapper">
    {#if $route.url !== "/"}
      <a class="small button" href="/">Home</a>
    {/if}
    {#if $networkError}
      <p>
        Connect your wallet to "{$networkError.want}"
        <button class="small secondary" on:click={connect}>Reconnect</button>
      </p>
    {/if}
    <div class="wallet">
      {#if $signer}
        <button class="small" on:click={disconnect} href="#">
          Disconnect {$shortAddress}
        </button>
      {:else}
        <button class="small wallet" on:click={connect} href="#">
          Connect Wallet
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    text-align: right;
    z-index: 1;
    backdrop-filter: blur(14px);
    background: rgba(255, 255, 255, 0.9);
  }

  .wrapper {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    justify-content: center;
  }

  p {
    margin: 0;
  }

  .wallet {
    flex: 1;
  }
</style>
