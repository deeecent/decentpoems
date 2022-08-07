<script lang="ts">
  import { signer, connect, disconnect, shortAddress } from "./stores/wallet";
</script>

<header>
  {#if $signer}
    <button class="small" on:click={disconnect} href="#">
      Disconnect {$shortAddress}
    </button>
  {:else}
    <button class="small wallet" on:click={connect} href="#">
      Connect Wallet
    </button>
  {/if}
</header>

<style>
  header {
    max-width: var(--max-width);
    text-align: right;
    margin: 0.5rem auto;
  }
</style>
