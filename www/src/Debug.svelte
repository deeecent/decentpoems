<script lang="ts">
  import { contractsAddresses } from "./stores/config";
</script>

{#each Object.keys(contractsAddresses) as key}
  <p>
    {key}: {contractsAddresses[key]}
  </p>
{/each}
