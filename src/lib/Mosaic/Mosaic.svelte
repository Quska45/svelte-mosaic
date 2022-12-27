<script lang="ts">
    import { v4 as uuid } from 'uuid';
    import { writable } from 'svelte/store'
    import {
        SplitEvent,
        WindowEvent
    } from './Event'
    import MosaicWindow from "../MosaicWindow/MosaicWindow.svelte";
    import Split from "../Split/Split.svelte";
    import type { Split as SplitTs } from "../Split/Split";
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
            split: function<T extends TMosaicKey>( parentTree: TMosaicNode<T>, isFirst: boolean ){
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

                mosaicPieceManager.mosaicWindows = [];
                mosaicPieceManager.splits = [];
                mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
            },
            delete: function<T extends TMosaicKey>( parentNodeId: string ){
                let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, parentNodeId );
                let currentTreeNode = ( currentTree as IMosaicParent<T> );

                mosaicPieceManager.changeParentTreeByNode( exampleAppState.currentNode, currentTreeNode )

                mosaicPieceManager.mosaicWindows = [];
                mosaicPieceManager.splits = [];
                mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
            },
            dragStart: function<T extends TMosaicKey>( e, mosaicWindow ){
                let currentMosaicIndex = mosaicPieceManager.mosaicWindows.findIndex(function( _mosaicWindow ){
                    return (_mosaicWindow.id == mosaicWindow.id) && (_mosaicWindow.isFirst == mosaicWindow.isFirst)
                });

                mosaicPieceManager.mosaicWindows[currentMosaicIndex].splitPercentage.inset.left = 30;
            },
            drop: function( e ){
                console.log(e.dataTransfer);
                e.target.parentNode.parentNode.style.display = 'block';
            },
            dragOver: function( e ){
                console.log(e.dataTransfer);
                e.target.parentNode.parentNode.style.display = 'block';
            },
            dragEnd: function( e ){
                console.log('dragend');
                e.target.parentNode.parentNode.style.display = 'block';
            }
        },
        split:{
            positionChange: function<T extends TMosaicKey>( e, split: SplitTs<T> ){
                function mousemove(mousemoveEvent){
                    let mousePosition = 0;
                    if( split.direction == 'row' ){
                        // mousePosition = parseInt((mousemoveEvent.clientX / document.body.offsetWidth * 100).toFixed(3));
                        mousePosition = mousemoveEvent.clientX / document.body.offsetWidth * 100;
                    } else {
                        // mousePosition = parseInt((mousemoveEvent.clientY / document.body.offsetHeight * 100).toFixed(3));
                        mousePosition = mousemoveEvent.clientY / document.body.offsetHeight * 100;
                    }
                    let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, split.id );
                    let currentTreeNode = ( currentTree as IMosaicParent<T> );
                    
                    split.splitPercentage.percentage = mousePosition;
                    currentTreeNode.splitPercentage.percentage = mousePosition;

                    mosaicPieceManager.mosaicWindows = [];
                    mosaicPieceManager.splits = [];
                    mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
                };

                window.addEventListener('mousemove', mousemove);

                window.addEventListener('mouseup', (mouseupEvent) => {
                    window.removeEventListener('mousemove', mousemove)
                });
            }
        }
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
            nodeId = { mosaicWindow.id }
            parentNodeId = { mosaicWindow.parentNodeId }
            direction = { mosaicWindow.direction }
            inset = { mosaicWindow.splitPercentage.inset }
            tree = { mosaicWindow.tree }
            parentTree = { mosaicWindow.parentTree }
            isFirst = { mosaicWindow.isFirst }
            testCallback = {testCallback}
            event = { event.window }
        
            mosaicWindow = { mosaicWindow }
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
            event = { event.split }
            
            split = { split }
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