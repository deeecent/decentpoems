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

  const length = 7;
</script>

<Grid noGutter padding>
  <Row>
    <Column>
      {#if !poem.title.text}
        <InlineNotification
          lowContrast
          kind="info"
          title="Hey you:"
          subtitle="Every decent poem starts with a decent title. "
          hideCloseButton
        />
      {:else}
        <Verse title author={poem.title.author} text={poem.title.text} />
      {/if}
      {#each poem.verses as { author, text }}
        <Verse {author} {text} />
      {/each}
    </Column>
  </Row>
  <Row>
    <Column>
      <AddVerse
        {contract}
        number={poem.verses.length + 1}
        {length}
        {word}
        {wordIndex}
      />
    </Column>
  </Row>
</Grid>
