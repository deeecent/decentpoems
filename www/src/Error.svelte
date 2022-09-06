<script lang="ts">
  import { panic } from "./stores/retry";
</script>

{#if $panic}
  <div>
    <section>
      <p>😢 There was an error, please reload the page.</p>
    </section>
  </div>
{/if}

<style>

@media (prefers-color-scheme: light) {
    div {
      background-color: rgba(255, 162, 162, 0.9);
    }
  }
  
  @media (prefers-color-scheme: dark) {
    div {
      background-color: #502b33;
    }
  }

  div {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    font-family: var(--sans-serif);
  }

  section {
    text-align: center;
  }
</style>
