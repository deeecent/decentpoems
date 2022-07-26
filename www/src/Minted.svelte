<script lang="ts">
  import { Button } from "carbon-components-svelte";
  import SvgPoem from "./SVGPoem.svelte";
  import type { Poem } from "./types";

  export let poem: Poem;
  let authors = [poem.title.author, ...poem.verses.map((v) => v.author)];
</script>

<h3>{poem.title.text}</h3>
<SvgPoem {poem} />
<div>
  Authors: {authors.join(", ")}
</div>

<Button size="small" kind="tertiary">View on OpenSea</Button>
<Button size="small" kind="tertiary">View 0xsplit</Button>
