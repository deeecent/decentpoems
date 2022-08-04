<script lang="ts">
  import { connect } from "./stores/wallet";

  import { networkError } from "./stores/wallet";
</script>

{#if $networkError}
  Network mismatch Connect your wallet to "{$networkError.want}"
  <button on:click={connect}> Reconnect </button>
{/if}
