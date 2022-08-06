<script lang="ts">
  import type { PoemAuction } from "./types";
  import Minted from "./Minted.svelte";

  export let poems: PoemAuction[];
</script>

<section>
  {#each poems as poem}
    <div class="item">
      <div class="wrapper">
        <Minted {poem} />
      </div>
    </div>
  {/each}
</section>

<style>
  section {
    display: flex;
    flex-wrap: wrap;
    gap: 3rem;
  }

  .item {
    width: 15rem;
    display: flex;
    align-items: flex-end;
  }
</style>
