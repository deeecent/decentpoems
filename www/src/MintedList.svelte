<script lang="ts">
  import type { Poem } from "./types";
  import { Grid, Column, Row } from "carbon-components-svelte";
  import Minted from "./Minted.svelte";

  export let poems: Poem[];
</script>

<Grid padding>
  {#each poems as poem}
    <Row>
      <Column><Minted {poem} /></Column>
    </Row>
  {/each}
</Grid>
