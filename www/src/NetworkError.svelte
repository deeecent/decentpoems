<script lang="ts">
  import { connect } from "./stores/wallet";

  import { networkError } from "./stores/wallet";
</script>

{#if $networkError}
  <div>
    <section>
      Network mismatch Connect your wallet to "{$networkError.want}"
      <button on:click={connect}> Reconnect </button>
    </section>
  </div>
{/if}

<style>
  div {
    position: fixed;
    top: 1rem;
    right: 0;
    left: 0;
    text-align: center;
    z-index: 100;
  }

  section {
    background-color: rgb(177, 177, 177);
  }

  button {
    display: inline;
    margin: 0;
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
</style>
