<script lang="ts">
  import type { PoemAuction } from "./types";

  export let poem: PoemAuction;

  const authors = Array.from(
    new Set([poem.title.author, ...poem.verses.map((v) => v.author)])
  );
</script>

<h3>{poem.title.text}</h3>
<img src={poem.metadata.image} />
<div>
  Authors: {authors.join(", ")}
</div>
