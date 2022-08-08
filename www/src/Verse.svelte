<script lang="ts">
  export let author: string;
  export let text: string;
  export let word: string;
  export let title = false;

  const position = text.search(new RegExp(`\\b${word}\\b`, "i"));
  const prefix = text.slice(0, position);
  const suffix = text.slice(position + word.length);
</script>

{#if title}
  <h1>{prefix}<mark>{word}</mark>{suffix}</h1>
{:else}
  <p class="verse">{prefix}<mark>{word}</mark>{suffix}</p>
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

  mark {
    background-color: rgba(35, 38, 78, 0.219);
  }

  .author {
    font-size: 0.8rem;
    margin-top: 0;
    margin-bottom: 0.4rem;
    color: #ccc;
    font-family: var(--monospace);
  }
</style>
