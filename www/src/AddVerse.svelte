<script lang="ts">
  import { Form, Button, TextArea } from "carbon-components-svelte";
  import type { DecentPoems } from "../../typechain";
  import { connect } from "./stores/wallet";

  export let contract: DecentPoems | null;
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

<p>Your verse must contain the word <strong>{word}</strong>.</p>

<Form on:submit={onSubmit}>
  <TextArea bind:value={text} labelText="Add your verse" />

  <Button disabled={!valid} type="submit">
    Submit verse {number}/{length}
  </Button>
</Form>
