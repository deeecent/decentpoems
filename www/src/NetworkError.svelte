<script lang="ts">
  import {
    Grid,
    Column,
    Row,
    InlineNotification,
    NotificationActionButton,
  } from "carbon-components-svelte";

  import { connect } from "./stores/wallet";

  import { networkError } from "./stores/wallet";
</script>

{#if $networkError}
  <Grid>
    <InlineNotification
      title="Network mismatch:"
      subtitle={`Connect your wallet to "${$networkError.want}"`}
      hideCloseButton
    >
      <svelte:fragment slot="actions">
        <NotificationActionButton on:click={connect}>
          Reconnect
        </NotificationActionButton>
      </svelte:fragment>
    </InlineNotification>
  </Grid>
{/if}
