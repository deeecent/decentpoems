<script lang="ts">
  import type { PoemAuction } from "./types";

  export let poem: PoemAuction;

  $: title =
    poem.title.text.length > 60
      ? poem.title.text.substring(0, 60) + "…"
      : poem.title.text;

  const authors = Array.from(
    new Set([poem.title.author, ...poem.verses.map((v) => v.author)])
  );
</script>

<h3>{title}</h3>
<img src={poem.metadata.image} />
<div>
  <a>View on OpenSea</a>
</div>

<style>
  img {
    width: 100%;
  }
</style>
