<script lang="ts">
  import type { Poem } from "./types";
  import Minted from "./Minted.svelte";

  export let poems: Poem[];
</script>

{#each poems as poem}
  <Minted {poem} />
{/each}
