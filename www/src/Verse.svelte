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
        <h1>{text}</h1>
      {:else}
        <p>{text}</p>
      {/if}
      <p class="author">{author}</p>
    </Column>
  </Row>
</Grid>

<style>
  h1 {
    font-size: 4rem;
  }

  p {
    font-size: 2rem;
  }

  .author {
    font-size: 1rem;
    opacity: 0.5;
  }
</style>
