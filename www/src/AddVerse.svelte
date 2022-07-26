<script lang="ts">
  import { Form, Button, TextArea } from "carbon-components-svelte";

  export let index: number;
  export let length: number;
  export let word: string;
  let text = "";

  $: valid = text.toLocaleLowerCase().split(/\W/).includes(word);

  async function onSubmit(e: Event) {
    e.preventDefault();
    alert(text);
  }
</script>

<p>Your verse must contain the word <strong>{word}</strong>.</p>

<Form on:submit={onSubmit}>
  <TextArea bind:value={text} labelText="Add your verse" />
  <Button disabled={!valid} type="submit">Submit verse {index}/{length}</Button>
</Form>
