<script lang="ts">
  import type { ContractTransaction } from "ethers";

  import type { DecentPoems } from "../../typechain";
  import Notification from "./Notification.svelte";
  import { connect } from "./stores/wallet";

  export let contract: DecentPoems | null;
  export let isTitle: boolean;
  export let number: number;
  export let length: number;
  export let word: string;

  let text = "";
  let pending = false;
  let status: null | "wait" | "sent" | "confirmed" | "error" = null;

  async function submitVerse() {
    status = "wait";
    if (!contract || position < 0) {
      status = null;
      throw new Error("Something bad happened");
    }

    let receipt: ContractTransaction;

    try {
      receipt = await contract.submitVerse(text, position);
    } catch (e) {
      console.error(e);
      status = "error";
      return;
    }
    status = "sent";
    try {
      await receipt.wait();
    } catch (e) {
      console.error(e);
      status = "error";
      return;
    }
    status = "confirmed";
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
      console.log("pending", contract);
      pending = false;
      submitVerse();
    }
  }

  $: position = text.search(new RegExp(`\\b${word}\\b`, "i"));
  $: disabled = status === "wait" || status === "sent";
</script>

{#if status === "wait"}
  <Notification>Waiting for your signature.</Notification>
{:else if status === "sent"}
  <Notification>Transaction sent, waiting for confirmation.</Notification>
{:else if status === "confirmed"}
  <Notification timeout={5000}>Transaction confirmed!</Notification>
{:else if status === "error"}
  <Notification timeout={5000}>
    There was an error sending your transaction, please try again.
  </Notification>
{/if}

<form on:submit={onSubmit}>
  {#if isTitle && text.length > 80}
    <p class="warning">
      A small suggestion: you are writing the title of the poem, we suggest you
      to keep it a bit shorter.
    </p>
  {/if}

  <textarea
    {disabled}
    bind:value={text}
    placeholder="Write here"
    rows={isTitle ? 1 : 3}
  />

  <button disabled={disabled || position < 0} type="submit">
    {#if isTitle}
      Submit title
    {:else}
      Submit verse {number} of {length}
    {/if}
  </button>
</form>

<style>
  textarea {
    font-family: var(--serif);
    font-size: 1.5rem;
    display: block;
    width: 100%;
    border: 2px solid black;
    resize: none;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  @supports selector(:focus-visible) {
    textarea:focus {
      /* Remove the focus indicator on mouse-focus for browsers
       that do support :focus-visible */
      outline: none;
      background: transparent;
    }
  }

  button {
    display: block;
    margin: 0 auto;
    padding: 1rem;
  }

  .warning {
    background-color: gold;
    padding: 1rem 2rem;
    width: 100%;
  }
</style>
