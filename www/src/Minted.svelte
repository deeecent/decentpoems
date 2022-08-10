<script lang="ts">
  import { linkToOpensea, linkToSplit } from "./stores/contract";

  import type { PoemAuction } from "./types";
  import { shortAddress } from "./utils";

  export let poem: PoemAuction;

  $: title =
    poem.title.text.length > 60
      ? poem.title.text.substring(0, 60) + "…"
      : poem.title.text;

  const authors = Array.from(
    new Set([poem.title.author, ...poem.verses.map((v) => v.author)])
  );
</script>

<h3><a href={linkToOpensea(poem.id)}>{title}</a></h3>
<a href={linkToOpensea(poem.id)}>
  <img src={poem.metadata.image} alt="A poem with title: {poem.title.text}" />
</a>
<div>
  <ul>
    <li>
      <a class="button small" href={linkToOpensea(poem.id)}>View on OpenSea</a>
    </li>
    <li>
      <a class="button secondary small" href={linkToSplit(poem.split)}
        >View split
      </a>
    </li>
  </ul>
</div>

<style>
  img {
    max-width: 100%;
    display: block;
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.2);
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: space-around;
  }

  li {
    margin: 0.5rem 0;
  }

  .button {
    margin: 0;
    display: inline-block;
  }
</style>
