<script lang="ts">
  import { Column, Row } from "carbon-components-svelte";
  import { contractsAddresses } from "./stores/config";
</script>

<Row>
  <Column>
    {#each Object.keys(contractsAddresses) as key}
      <p>
        {key}: {contractsAddresses[key]}
      </p>
    {/each}
  </Column>
</Row>
