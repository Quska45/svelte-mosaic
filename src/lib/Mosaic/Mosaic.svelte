<script lang="ts">
    import { v4 as uuid } from 'uuid';
    import { writable } from 'svelte/store'
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
    import type { IMosaicParent, TMosaicNode } from '../MosaicNode/MosaicNode';
    import type { TMosaicKey } from '../types/types';
    import { Inset } from '../Common/Inset';
    
    export let exampleAppState: IExampleAppState;

    MosaicNodeStore.set( exampleAppState.currentNode );

    let mosaicPieceManager = new MosaicPieceManager<number>();
    mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
    console.log(mosaicPieceManager.mosaicWindows)
    console.log(mosaicPieceManager.splits)
    console.log(exampleAppState.currentNode)

    const event = {
        window:{
            split: function<T extends TMosaicKey>( tree: TMosaicNode<T>, parentTree: TMosaicNode<T>, isFirst: boolean ){
                let treeNode = ( tree as IMosaicParent<T> );
                let parentTreeNode = ( parentTree as IMosaicParent<T> );
                let node: TMosaicNode<T> = {
                    id: uuid(),
                    title: 'newWindow',
                    parentNodeId: parentTreeNode.id,
                    direction: 'row',
                    first: ( 0 as TMosaicNode<T> ),
                    second: ( 0 as TMosaicNode<T> ),
                    splitPercentage: {
                        percentage: 50,
                    }
                };

                let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, parentTreeNode.id );
                let currentTreeNode = ( currentTree as IMosaicParent<T> );
                isFirst ? currentTreeNode.first = node : currentTreeNode.second = node;

                node.splitPercentage.inset = currentTreeNode.splitPercentage.inset;

                let firstAndSecondInset = Inset.getFirstAndSecondInsetByTree( node );
                console.log('firstAndSecondInset');
                console.log(firstAndSecondInset);
                currentTreeNode.splitPercentage.firstInset = firstAndSecondInset.first;
                currentTreeNode.splitPercentage.secondInset = firstAndSecondInset.second;

                let secondNode = mosaicPieceManager.getMosaicNodeObjByTree( node, parentTree, false );
                //  배열을 참조해도록 해줘야만 화면이 재 렌더링 된다. 왜 이러는지 모르겠음.
                mosaicPieceManager.mosaicWindows = [...mosaicPieceManager.mosaicWindows, secondNode];

                console.log(exampleAppState.currentNode);
                // console.log(tree);
                console.log(secondNode);
            },
        },
        split:{}
    }

    function testCallback(){
        // $mosaicWindows[0].splitPercentage.inset.right = 30;
        // let test = [...$mosaicWindows]
        // $mosaicWindows = [...$mosaicWindows, test[0]];
        // console.log($mosaicWindows);
        
        // $mosaicWindows.push( $mosaicWindows[0] );
        // $mosaicWindows = [$mosaicWindows[0]];
        // console.log($mosaicWindows);

        let node: TMosaicNode<number> = {
            id: uuid(),
            title: 'newWindow',
            parentNodeId: 'parentTreeNode.id',
            direction: 'row',
            first: ( 0 as TMosaicNode<number> ),
            second: ( 0 as TMosaicNode<number> ),
            splitPercentage: {
                percentage: 50
            }
        };

        let secondNode= mosaicPieceManager.getMosaicNodeObjByTree( node, exampleAppState.currentNode, false );
        // $mosaicWindows = [...$mosaicWindows, secondNode];
    }


</script>

<div class="mosaic">
    {#each mosaicPieceManager.mosaicWindows as mosaicWindow}
        <MosaicWindow
            mosaicWindow = { mosaicWindow }
            nodeId = { mosaicWindow.id }
            parentNodeId = { mosaicWindow.parentNodeId }
            direction = { mosaicWindow.direction }
            inset = { mosaicWindow.splitPercentage.inset }
            tree = { mosaicWindow.tree }
            parentTree = { mosaicWindow.parentTree }
            isFirst = { mosaicWindow.isFirst }
            testCallback = {testCallback}
            event = { event.window }

            mosaicPieceManager = { mosaicPieceManager }
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