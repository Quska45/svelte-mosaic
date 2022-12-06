<script lang="ts">
    import {flip} from "svelte/animate";
    import {dndzone} from "svelte-dnd-action";
    export let items;
    const flipDurationMs = 300;

    function handleDndConsider(e: any): void {
        items = e.detail.items;
    }

    function handleDndFinalize(e: any): void {
        items = e.detail.items;
    }
</script>

<div>
    <section use:dndzone="{{items, flipDurationMs}}" on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
        {#each items as item(item.id)}
        <div>{item.name}</div>
        {/each}
    </section>
</div>

<style>
    section {
        width: calc(100%-0.6em);
        padding: 0.3em;
        border: 1px solid black;
        /* this will allow the dragged element to scroll the list */
        height: 100%;
    }
</style>