<script lang="ts">
  import AddVerse from "./AddVerse.svelte";

  import Verse from "./Verse.svelte";
  import type { DecentPoems } from "../../typechain";
  import type { Poem } from "./types";

  export let poem: Poem;
  export let word: string;
  export let wordIndex: number;
  export let contract: DecentPoems | null;

  let hasTitle = !poem.title.text;
  const length = 6;
</script>

{#if !hasTitle}
  <div class="poem">
    {#if poem.title.text}
      <div class="title">
        <Verse title author={poem.title.author} text={poem.title.text} />
      </div>
    {/if}
    {#each poem.verses as { author, text }}
      <div class="verse">
        <Verse {author} {text} />
      </div>
    {/each}
  </div>
{/if}

<div class="add-verse">
  <p class="small">
    {#if hasTitle}
      You got a once in a lifetime opportunity to start a new poem. Very lucky
      indeed. All you have to do is to write the title of the poem.
      <br />
      The title must include the word:
    {:else if poem.verses.length === 0}
      You are officially invited to write the first verse for this poem. There
      are <strong>{length} verses in total</strong>. Write something that makes
      sense with the title.
      <br />
      Remember, your verse must include the word:
    {:else if poem.verses.length === 1}
      We are just getting started! We have a title and the first verse. It's now
      your turn to write the second verse. There are <strong
        >{length} verses in total</strong
      >.
      <br />
      Remember, your verse must include the word:
    {:else}
      Verse {poem.verses.length + 1} of {length} must include the word:
    {/if}
  </p>

  <p class="word">{word}</p>

  <AddVerse
    {contract}
    {hasTitle}
    number={poem.verses.length + 1}
    {length}
    {word}
    {wordIndex}
  />
</div>

<style>
  .poem,
  .add-verse {
    padding: 4rem;
  }

  .poem {
    border-bottom: 1px dashed black;
  }

  .small,
  .word {
    text-align: center;
  }

  .small {
    font-size: 1rem;
    font-style: italic;
    text-align: left;
  }

  .word {
    font-size: 3rem;
    font-weight: bold;
    margin: 1.5rem 0;
  }

  .title {
    margin-bottom: 4rem;
  }

  .verse {
    margin-bottom: 3rem;
  }

  .add-verse {
    background-color: #eee;
  }
</style>
