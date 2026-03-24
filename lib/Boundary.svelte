<script>
    import pkg from "../package.json"
    import { getContext } from "svelte"

    export let error = null

    const { styleable } = getContext("sdk")
    const component = getContext("component")

    $: styles = {
      normal: {},
      id: $component.id,
      interactive: true
    }
</script>

{#if $error}
  <div class="error" use:styleable={styles}>
    <b>Error in "{pkg.name}" plugin:</b>
    <div class="detail">{$error}</div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error {
    background: var(--spectrum-global-color-red-400);
    color: white;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 300px;
  }
  .detail {
    font-family: monospace;
    font-size: 11px;
    padding: 8px;
    background: rgba(0,0,0,0.15);
    border-radius: 4px;
    max-height: 120px;
    overflow: auto;
  }
</style>
