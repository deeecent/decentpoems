<script lang="ts">
  import { Form, Button, TextArea } from "carbon-components-svelte";
  import type { DecentPoems } from "../../typechain";
  import { connect } from "./stores/wallet";

  export let contract: DecentPoems | null;
  export let isTitle: boolean;
  export let number: number;
  export let length: number;
  export let word: string;
  export let wordIndex: number;
  let text = "";
  let pending = false;

  $: valid = text.toLocaleLowerCase().split(/\W/).includes(word);

  async function submitVerse() {
    const pos = text.toLocaleLowerCase().indexOf(word);
    if (!contract || pos < 0) {
      throw new Error("Something bad happened");
    }
    const prefix = text.slice(0, pos);
    const suffix = text.slice(pos + word.length);
    await contract.submitVerse(prefix, wordIndex, suffix);
    text = "";
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    if (!contract) {
      try {
        await connect();
      } catch (e) {
        console.error(e);
      }
      pending = true;
      return;
    }

    if (contract) {
      submitVerse();
    }
  }

  $: {
    if (contract && pending) {
      pending = false;
      submitVerse();
    }
  }
</script>

{#if isTitle}
  <p>Write the title of the poem (remember to include the current word)</p>
{:else}
  <p>Write a new verse (remember to include the current word)</p>
{/if}

<Form on:submit={onSubmit}>
  <TextArea bind:value={text} rows={isTitle ? 1 : 3} />

  <Button disabled={!valid} type="submit">
    {#if isTitle}
      Submit title
    {:else}
      Submit verse {number}/{length}
    {/if}
  </Button>
</Form>
