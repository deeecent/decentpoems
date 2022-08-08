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
<p class="author ellipsis">by {author}</p>

<style>
  h1 {
    font-size: 2.5rem;
  }

  .verse {
    font-size: 1.5rem;
    margin: 0;
  }

  h1,
  .verse {
    margin-bottom: 0.1rem;
  }

  .author {
    font-size: 0.8rem;
    margin-top: 0;
    margin-bottom: 0.4rem;
    color: #ccc;
    font-family: var(--monospace);
  }
</style>
