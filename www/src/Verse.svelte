<script lang="ts">
  import { Column, Row, Grid } from "carbon-components-svelte";

  export let author: string;
  export let text: string;
  export let title = false;
</script>

<Grid padding={false}>
  <Row>
    <Column>
      {#if title}
        <h3>{text}</h3>
      {:else}
        <p>{text}</p>
      {/if}
    </Column>
    <Column>
      <p>{author}</p>
    </Column>
  </Row>
</Grid>
