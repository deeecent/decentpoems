<script lang="ts">
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";

  export let timeout: number | null = null;

  let show = true;

  onMount(async () => {
    if (timeout) {
      const timerId = window.setTimeout(() => {
        show = false;
      }, timeout);

      return () => {
        window.clearTimeout(timerId);
      };
    }
  });
</script>

{#if show}
  <section transition:fade><slot /></section>
{/if}

<style>
  section {
    background: rgb(51, 51, 51);
    margin: 0;
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 30rem;
    border-radius: 5px;
    border: 1px solid black;
    color: white;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.4);
    padding: 1.5rem 2rem;
    z-index: 100;
  }
</style>
