<script lang="ts">
    import MosaicWithoutDragDropContext from "../MosaicWithoutDragDropContext/MosaicWithoutDragDropContext.svelte";
    import MosaicWindow from "../MosaicWindow/MosaicWindow.svelte";
    import Split from "../Split/Split.svelte";
    import {
        MosaicNode
    } from "../MosaicNode/MosaicNode"
    import type {
        IExampleAppState
    } from '../../App'
    

    export let exampleAppState: IExampleAppState;
    let tree = exampleAppState.currentNode;
    // let mosaicNode = new MosaicNode(  );
</script>

<div class="mosaic">
    {JSON.stringify(exampleAppState)}
</div>

<style>
    .mosaic {
        height: calc(100% - 50px);
    }
</style>