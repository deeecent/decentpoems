<script lang="ts">
  import AddVerse from "./AddVerse.svelte";

  import Verse from "./Verse.svelte";
  import type { DecentPoems } from "../../typechain";
  import type { Poem } from "./types";

  export let poem: Poem;
  export let word: string;
  export let wordIndex: number;
  export let contract: DecentPoems | null;

  $: isTitle = !poem.title.text;
  const length = 6;
</script>

{#if !isTitle}
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
  {#if isTitle}
    <p class="small">
      How did you get here? We don't know. But we know that you should stop
      hesitating and write the title for the greatest poem ever written. <strong
        >It's your turn, but if you don't act fast enough someone else will
        write it</strong
      >
      <br />
      The title must include the word:
    </p>
  {:else if poem.verses.length === 0}
    <p class="small">
      You are officially invited to write the first verse for this poem. There
      are <strong>{length} verses in total</strong>. Write something that makes
      sense with the title.
      <br />
      Remember, your verse must include the word:
    </p>
  {:else if poem.verses.length === 1}
    <p class="small">
      We are just getting started! We have a title and the first verse. It's now
      your turn to write the second verse. There are <strong
        >{length} verses in total</strong
      >.
      <br />
      Remember, your verse must include the word:
    </p>
  {:else}
    <p class="small">
      Verse {poem.verses.length + 1} of {length} must include the word:
    </p>
  {/if}

  <p class="word">{word}</p>

  {#if word !== ""}
    <AddVerse
      {contract}
      {isTitle}
      number={poem.verses.length + 1}
      {length}
      {word}
      {wordIndex}
    />
  {:else}
    loading.
  {/if}
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
    font-size: 1.3rem;
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
    font-family: "Prompt", sans-serif;
  }

  .verse {
    margin-bottom: 3rem;
  }

  .add-verse {
    background-color: #eee;
  }
</style>
