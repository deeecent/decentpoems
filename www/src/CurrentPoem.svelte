<script lang="ts">
  import AddVerse from "./AddVerse.svelte";
  import { Grid, Column, Row } from "carbon-components-svelte";

  import Verse from "./Verse.svelte";

  const verses = [
    {
      author: "0x4EB46ed918Ab2A037086F9073d068eF3E9496C21",
      text: "A Decent Poem",
    },
    {
      author: "0x4EB46ed918Ab2A037086F9073d068eF3E9496C21",
      text: "A fox jumps high jumps high jumps high jumps high jumps high jumps high jumps high jumps high jumps high jumps high",
    },
    {
      author: "0x4EB46ed918Ab2A037086F9073d068eF3E9496C21",
      text: "Something something",
    },
    {
      author: "0x4EB46ed918Ab2A037086F9073d068eF3E9496C21",
      text: "I found something else",
    },
  ];

  const length = 7;
  const currentWord = "bread";
</script>

<Grid noGutter padding>
  <Row>
    <Column>
      <h1>HyperPoem</h1>
    </Column>
  </Row>
  <Row>
    <Column>
      <Verse title author={verses[0].author} text={verses[0].text} />
      {#each verses.slice(1) as { author, text }}
        <Verse {author} {text} />
      {/each}
    </Column>
  </Row>
  <Row>
    <Column>
      <AddVerse index={verses.length + 1} {length} word={currentWord} />
    </Column>
  </Row>
</Grid>
