<script lang="ts">
  import { fade } from "svelte/transition";
  import AddVerse from "./AddVerse.svelte";

  import Verse from "./Verse.svelte";
  import type { DecentPoems } from "../../typechain";
  import type { Poem } from "./types";
  import Loading from "./Loading.svelte";

  export let poem: Poem;
  export let word: string;
  export let contract: DecentPoems | null;

  $: isTitle = !poem.title.text;
  const length = 6;
</script>

{#if !isTitle}
  <div class="poem">
    {#if poem.title.text}
      <div in:fade class="title">
        <Verse
          title
          author={poem.title.author}
          text={poem.title.text}
          word={poem.title.word}
        />
      </div>
    {/if}
    {#each poem.verses as { author, text, word }}
      <div in:fade class="verse">
        <Verse {author} {text} {word} />
      </div>
    {/each}
  </div>
{/if}

<div class="add-verse">
  {#if word !== ""}
    {#if isTitle}
      <p class="small">
        How did you get here? We don't know. But we know that you should stop
        hesitating and write the <strong>title</strong> of the greatest<abbr
          title="hopefully">*</abbr
        >
        poem ever written.
        <strong
          >It's your turn, but if you don't act fast enough someone else will
          write it.</strong
        >
        <br />
        The title must include the word:
      </p>
    {:else if poem.verses.length === 0}
      <p class="small">
        You are officially invited to write the first verse for this poem. There
        are <strong>{length} verses in total</strong>. Write something that
        makes sense with the title.
        <br />
        Remember, your verse must include the word:
      </p>
    {:else if poem.verses.length === 1}
      <p class="small">
        We are just getting started! We have a title and the first verse. It's
        now your turn to write the second verse. There are <strong
          >{length} verses in total</strong
        >.
        <br />
        Remember, your verse must include the word:
      </p>
    {:else if poem.verses.length === 2}
      <p class="small">
        Half way through! We have the title and the first two verses. It's now
        your turn to write the third verse. There are <strong
          >{length} verses in total</strong
        >.
        <br />
        Remember, your verse must include the word:
      </p>
    {:else if poem.verses.length === 3}
      <p class="small">
        Nice, does it make sense or not until now? It's your turn to write the
        fourth verse. There are <strong>{length} verses in total</strong>.
        <br />
        Remember, your verse must include the word:
      </p>
    {:else if poem.verses.length === 4}
      <p class="small">
        Almost there. Write the fifth verse. There are <strong
          >{length} verses in total</strong
        >.
        <br />
        Remember, your verse must include the word:
      </p>
    {:else if poem.verses.length === 5}
      <p class="small">
        This is the last verse. Focus.
        <br />
        Remember, your verse must include the word:
      </p>
    {:else}
      <p class="small">
        Verse {poem.verses.length + 1} of {length} must include the word:
      </p>
    {/if}

    <p class="word">{word}</p>

    <AddVerse
      {contract}
      {isTitle}
      number={poem.verses.length + 1}
      {length}
      {word}
    />
  {:else}
    <p class="small centered new-word-loading">
      <em>A new word will pop up soon, give it some seconds!</em>
    </p>
    <Loading />
  {/if}
</div>

<style>
  .poem,
  .add-verse {
    padding: 4rem;
    min-height: 300px;
  }

  .poem {
    border-bottom: 1px dashed rgb(200, 200, 200);
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
  .word,
  .centered {
    text-align: center;
  }

  .title {
    margin-bottom: 4rem;
    font-family: "Prompt", sans-serif;
  }

  .verse {
    margin: 0 0 0.8rem 0;
  }

  .add-verse {
    background-color: #f3f3f3;
  }
</style>
