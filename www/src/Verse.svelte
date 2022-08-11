<script lang="ts">
  export let author: string;
  export let text: string;
  export let word: string;
  export let title = false;

  const position = text.search(new RegExp(`\\b${word}\\b`, "i"));
  const prefix = text.slice(0, position);
  const originalWord = text.slice(position, word.length);
  const suffix = text.slice(position + word.length);
</script>

{#if title}
  <p><em>Poem title:</em></p>
  <h1>{prefix}<mark>{originalWord}</mark>{suffix}</h1>
{:else}
  <p class="verse">{prefix}<mark>{originalWord}</mark>{suffix}</p>
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
    margin-top: 0;
    margin-bottom: 0.1rem;
  }

  mark {
    color: inherit;
    background: linear-gradient(
      0deg,
      rgba(35, 38, 78, 0.2) 35%,
      rgba(255, 255, 255, 0) 35%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .author {
    font-size: 0.8rem;
    margin-top: 0;
    margin-bottom: 0.4rem;
    color: #ccc;
    font-family: var(--monospace);
  }
</style>
