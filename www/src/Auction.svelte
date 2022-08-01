<script lang="ts">
  import { Button } from "carbon-components-svelte";
  import SvgPoem from "./SVGPoem.svelte";
  import type { Poem } from "./types";

  export let poem: Poem;
  let authors = [poem.title.author, ...poem.verses.map((v) => v.author)];
</script>

<p>Time left: 12h 45m 21s</p>
<h3>{poem.title.text}</h3>
<img src={poem.metadata?.image} />
<div>
  Authors: {authors.join(", ")}
</div>

<Button>Mint for 0.2 Eth</Button>
