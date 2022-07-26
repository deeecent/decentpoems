<script lang="ts">
  import Verse from "./Verse.svelte";

  const verses = ["A fox jumps high"];
  const length = 7;
</script>

<section>
  {#each verses as text, index}
    <Verse index={index + 1} {length} {text} />
  {/each}
</section>
