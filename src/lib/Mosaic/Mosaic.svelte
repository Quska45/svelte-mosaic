<script lang="ts">
    import {
        SplitEvent,
        WindowEvent
    } from './Event'
    import MosaicWindow from "../MosaicWindow/MosaicWindow.svelte";
    import Split from "../Split/Split.svelte";
    import { MosaicNodeStore } from "./MosaicStateStore";
    import type {
        IExampleAppState
    } from '../../App'
    import { MosaicPieceManager } from '../MosaicNode/MosaicPieceManager';
    
    export let exampleAppState: IExampleAppState;

    MosaicNodeStore.set( exampleAppState.currentNode );

    let mosaicPieceManager = new MosaicPieceManager<number>();
    mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
    console.log(mosaicPieceManager.mosaicWindows)
    console.log(mosaicPieceManager.splits)
</script>

<div class="mosaic">
    {#each mosaicPieceManager.mosaicWindows as mosaicWindow}
        <MosaicWindow
            nodeId = { mosaicWindow.id }
            parentNodeId = { mosaicWindow.parentNodeId }
            direction = { mosaicWindow.direction }
            inset = { mosaicWindow.splitPercentage.inset }
            tree = { mosaicWindow.tree }
            parentTree = { mosaicWindow.parentTree }
            isFirst = { mosaicWindow.isFirst }

            splits = { mosaicPieceManager.splits }
            mosaicWindows = { mosaicPieceManager.mosaicWindows }
        ></MosaicWindow>
    {/each}
    {#each mosaicPieceManager.splits as split}
        <Split
            nodeId = { split.id }
            parentNodeId = { split.parentNodeId }
            direction= { split.direction }
            inset = { split.splitPercentage.inset }
            tree = { split.tree }
            parentTree = { split.parentTree }

            splits={ mosaicPieceManager.splits }
            mosaicWindows={ mosaicPieceManager.mosaicWindows }
        ></Split>
    {/each}
</div>

<style>
    .mosaic {
        height: calc(100% - 60px);
        position: relative;
    }
</style>