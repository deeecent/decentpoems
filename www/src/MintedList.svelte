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
    --gap: 3rem;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap);
  }

  .item {
    width: calc(50% - var(--gap));
    display: flex;
    align-items: flex-end;
  }

  @media (max-width: 900px) {
    .item {
      width: 100%;
    }
  }

  .wrapper {
    width: 100%;
  }
</style>
