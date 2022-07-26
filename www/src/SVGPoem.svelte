<script lang="ts">
  import type { Poem } from "./types";

  export let poem: Poem;
</script>

<svg
  viewBox="0 0 600 600"
  width="600"
  height="600"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect width="100%" height="100%" fill="white" />
  <foreignObject width="600" height="600">
    <div xmlns="http://www.w3.org/1999/xhtml">
      {#each poem.verses as verse}
        <p>{verse.text}</p>
      {/each}
    </div>
  </foreignObject>
</svg>

<style>
  svg {
    max-width: 100%;
  }
</style>
