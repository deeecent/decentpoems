<script lang="ts">
  export let author: string;
  export let text: string;
  export let title = false;
</script>

{#if title}
  <h1>{text}</h1>
{:else}
  <p class="verse">{text}</p>
{/if}
<p class="author">{author}</p>

<style>
  h1 {
    font-size: 2.5rem;
  }

  .verse {
    font-size: 1.5rem;
  }

  h1,
  .verse {
    margin-bottom: 0.5rem;
  }

  .author {
    font-size: 0.8rem;
    opacity: 0.5;
    margin-top: 0;
    margin-bottom: 2rem;
    font-family: var(--monospace);
  }
</style>
