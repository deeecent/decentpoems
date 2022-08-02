<script lang="ts">
  import AddVerse from "./AddVerse.svelte";
  import {
    Grid,
    Column,
    Row,
    Tile,
    InlineNotification,
  } from "carbon-components-svelte";

  import Verse from "./Verse.svelte";
  import type { DecentPoems } from "../../typechain";
  import type { Poem } from "./types";

  export let poem: Poem;
  export let word: string;
  export let wordIndex: number;
  export let contract: DecentPoems | null;

  const length = 6;
</script>

<Grid noGutter padding>
  <Row>
    <Column>
      {#if poem.title.text}
        <Verse title author={poem.title.author} text={poem.title.text} />
      {/if}
      {#each poem.verses as { author, text }}
        <Verse {author} {text} />
      {/each}
    </Column>
  </Row>
  <Row>
    <Column>
      <p class="small">the current word is:</p>
      <p class="word">{word}</p>
    </Column>
  </Row>
  <Row>
    <Column>
      <AddVerse
        {contract}
        isTitle={!poem.title.text.length}
        number={poem.verses.length + 1}
        {length}
        {word}
        {wordIndex}
      />
    </Column>
  </Row>
</Grid>

<style>
  .small,
  .word {
    text-align: center;
  }

  .small {
    font-size: 1rem;
    font-style: italic;
  }

  .word {
    font-size: 3rem;
    font-weight: bold;
  }
</style>
