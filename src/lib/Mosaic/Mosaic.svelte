<script lang="ts">
    import { v4 as uuid } from 'uuid';
    import { writable } from 'svelte/store'
    import MosaicWindow from "../MosaicWindow/MosaicWindow.svelte";
    import Split from "../Split/Split.svelte";
    import type { Split as SplitTs } from "../Split/Split";
    import { MosaicNodeStore } from "./MosaicStateStore";
    import type {
        IExampleAppState
    } from '../../App'
    import { MosaicPieceManager } from '../MosaicNode/MosaicPieceManager';
    import type { IMosaicParent, MosaicNode, TMosaicDirection, TMosaicNode } from '../MosaicNode/MosaicNode';
    import type { TMosaicKey } from '../types/types';
    import { Inset } from '../Common/Inset';
    import DropTargetContainer from '../DropTargetContainer/DropTargetContainer.svelte';
    import { compute_rest_props, globals, identity } from 'svelte/internal';
    import { Section, TargetSection } from './TargetSection';
    
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

                let currentWindowIndex;
                isFirst ? currentWindowIndex =  dragFunction.getFirstMosaicWindowIndexById( currentTreeNode.id ) : currentWindowIndex =  dragFunction.getSecondMosaicWindowIndexById( currentTreeNode.id );

                let currentWindow = mosaicPieceManager.mosaicWindows[ currentWindowIndex ];
                let width = (100 - (currentWindow.splitPercentage.inset.left + currentWindow.splitPercentage.inset.right)) /2;
                let height = (100 - (currentWindow.splitPercentage.inset.top + currentWindow.splitPercentage.inset.bottom)) /2;
                width >= height ? node.direction = 'row' : node.direction = 'column';

                isFirst ? currentTreeNode.first = node : currentTreeNode.second = node;

                mosaicPieceManager.mosaicWindows = [];
                mosaicPieceManager.splits = [];
                mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
            },
            delete: function<T extends TMosaicKey>( parentNodeId: string, isFirst ){
                let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, parentNodeId );
                let currentTreeNode = ( currentTree as IMosaicParent<T> );

                mosaicPieceManager.changeParentTreeByNode( exampleAppState.currentNode, currentTreeNode, isFirst );

                mosaicPieceManager.mosaicWindows = [];
                mosaicPieceManager.splits = [];
                mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
            },
            mouseDown: function<T extends TMosaicKey>( e, mosaicWindow: MosaicNode<T> ){
            },
            mouseUp: function( e ){
                let currentMosaicWindowDom = dragFunction.getMosaicWindowDomByDom( e.target );
            },
            /**
             * dragStart ???????????? ????????? ?????? ???????????? ????????? ??????.
             * ???????????? ????????? ?????? ????????? split??? inset??? 100?????? ????????? ??????.
             * ????????? ????????? ?????? ???????????? inset??? ????????? ????????? ???????????? ??? ?????? ??????.
             * dragover??? ??????????????? shadow??? ?????? dnd ????????? ???????????? ?????? ????????? ?????? ?????????. 
            */
            dragStart: function<T extends TMosaicKey>( e, mosaicWindow: MosaicNode<T> ){
                let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, mosaicWindow.id );
                let currentWindowIndex = mosaicWindow.isFirst ? dragFunction.getFirstMosaicWindowIndexById( mosaicWindow.id ) : dragFunction.getSecondMosaicWindowIndexById( mosaicWindow.id );
                let currentWindow = mosaicPieceManager.mosaicWindows[ currentWindowIndex ];

                // e.target.parentElement.parentElement.style.opacity = 0;

                let parentTreeNode = ( currentWindow.parentTree as IMosaicParent<T> );

                // ???????????? ????????? ????????? ???????????? ????????? ?????????.
                dragValue.beforeDrag.splitPercentage = parentTreeNode.splitPercentage.percentage;
                dragValue.beforeDrag.tree = currentWindow.parentTree;
                dragValue.beforeDrag.isFirst = mosaicWindow.isFirst;
                dragValue.beforeDrag.id = mosaicWindow.id;
                dragValue.beforeDrag.parentId = mosaicWindow.parentNodeId;
                
                // ?????? window split??? resize ??????
                dragFunction.setPiecesSplitPercentageByTree( currentTree, e.target.parentElement.parentElement, currentWindow.isFirst );

                // ?????? ????????? ???????????? ????????? ??? ???????????? ???????????? ????????? ?????? ????????? ?????? ??????. ????????? ????
                let currentSplitIndex = dragFunction.getSplitIndexById( mosaicWindow.id );
                mosaicPieceManager.splits[ currentSplitIndex ].isDisplay = 'none';

                dragValue.beforeDrag.selectedDom = e.target.parentElement.parentElement;

                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData( 'mosaicWindow', JSON.stringify(mosaicWindow) );
            },
            drop: function( e ){
            },
            // enter, over??? ????????? ????????? ????????? ????????? ???. ?????? ?????? ?????????
            dragOver: function( e ){
                let currentMosaicWindowDom = dragFunction.getMosaicWindowDomByDom( e.target );
                dragValue.beforeDrag.selectedDom.style.zIndex = -1;
                dragValue.beforeDrag.selectedDom.style.display = 'none';
                
                let dataset = currentMosaicWindowDom.dataset;
                // ???????????? ???????????? ??? ????????? dom??? dragenter ?????? ??????
                if( 
                    dataset.nodeId == dragValue.beforeDrag.id
                    && dataset.parentNodeId == dragValue.beforeDrag.parentId
                    && dataset.isFirst == dragValue.beforeDrag.isFirst.toString()
                ){
                    return;
                };
                
                e.dataTransfer.dropEffect = 'move';
                let shadow = document.getElementById( 'drop-target-container' );
                let boundingRect = currentMosaicWindowDom.getBoundingClientRect();
                let targetSection = new TargetSection( boundingRect.left, boundingRect.top, boundingRect.right, boundingRect.bottom, 'TargetSection' );
                targetSection.setSectionList();
                dragValue.targetSection = targetSection;

                let shadowSection: Section = dragValue.targetSection.getShadowSectionByXY( e.clientX, e.clientY );
                if( shadowSection.type == 'empty' ){
                    shadow.style.display = 'none';
                    shadow.style.zIndex = '-1';
                    dragValue.shadowSection.type = 'empty';
                    return;
                }
                
                shadow.style.display = 'block';
                shadow.style.zIndex = '10';
                shadow.style.inset = `${currentMosaicWindowDom.style.inset}`;
                dragValue.afterDrag.dom = currentMosaicWindowDom;

            },
            dragEnter: function( e ){
                let currentMosaicWindowDom = dragFunction.getMosaicWindowDomByDom( e.target );
                dragValue.beforeDrag.selectedDom.style.zIndex = -1;
                dragValue.beforeDrag.selectedDom.style.display = 'none';
                
                let dataset = currentMosaicWindowDom.dataset;
                // ???????????? ???????????? ??? ????????? dom??? dragenter ?????? ??????
                if( 
                    dataset.nodeId == dragValue.beforeDrag.id
                    && dataset.parentNodeId == dragValue.beforeDrag.parentId
                    && dataset.isFirst == dragValue.beforeDrag.isFirst.toString()
                ){
                    return;
                };

                e.dataTransfer.dropEffect = 'move';
                let shadow = document.getElementById( 'drop-target-container' );
                let boundingRect = currentMosaicWindowDom.getBoundingClientRect();
                let targetSection = new TargetSection( boundingRect.left, boundingRect.top, boundingRect.right, boundingRect.bottom, 'TargetSection' );
                targetSection.setSectionList();
                dragValue.targetSection = targetSection;

                let shadowSection: Section = dragValue.targetSection.getShadowSectionByXY( e.clientX, e.clientY );
                if( shadowSection.type == 'empty' ){
                    shadow.style.display = 'none';
                    shadow.style.zIndex = '-1';
                    dragValue.shadowSection.type = 'empty';
                    return;
                }
                
                shadow.style.display = 'block';
                shadow.style.zIndex = '10';
                shadow.style.inset = `${currentMosaicWindowDom.style.inset}`;
                dragValue.afterDrag.dom = currentMosaicWindowDom;

            },
            dragEnd: function<T extends TMosaicKey>( e, test ){
                let currentMosaicWindowDom = dragFunction.getMosaicWindowDomByDom( e.target );
                let shadow = document.getElementById( 'drop-target-container' );

                dragValue.beforeDrag.selectedDom.style.zIndex = 0;
                dragValue.beforeDrag.selectedDom.style.opacity = 1;
                dragValue.beforeDrag.selectedDom.style.display = 'block';
                
                shadow.style.display = 'none';
                shadow.style.zIndex = '-1';

                let node: TMosaicNode<T> = {
                    id: uuid(),
                    title: 'newWindow',
                    parentNodeId: 'parentNodeid',
                    direction: 'row',
                    first: ( 0 as TMosaicNode<T> ),
                    second: ( 0 as TMosaicNode<T> ),
                    splitPercentage: {
                        percentage: 50,
                    }
                };

                let afterDragId = dragValue.afterDrag.dom.dataset.nodeId;
                let beforDragId = dragValue.beforeDrag.id;
                let beforDragTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, dragValue.beforeDrag.id );
                let beforDragTreeNode = ( beforDragTree as IMosaicParent<T> );

                let afterDragTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, afterDragId );
                let afterDragTreeNode = ( afterDragTree as IMosaicParent<T> );

                // ?????? shadow??? ????????? ?????? ????????? ????????? ??????.
                if( dragValue.shadowSection.type == 'TopHalf' ){
                    let afterDragDataset = dragValue.afterDrag.dom.dataset;
                    node.direction = 'column';

                    if( afterDragId == beforDragId ){
                        afterDragTreeNode.splitPercentage.percentage = 50;
                        afterDragTreeNode.direction = 'column';
                        mosaicPieceManager.mosaicWindows = [];
                        mosaicPieceManager.splits = [];
                        mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
                        return;
                    };

                    mosaicPieceManager.changeParentTreeByNode( exampleAppState.currentNode, beforDragTreeNode, dragValue.beforeDrag.isFirst );

                    let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, afterDragDataset.nodeId );
                    let currentTreeNode = ( currentTree as IMosaicParent<T> );

                    node.parentNodeId = afterDragDataset.nodeId;
                    JSON.parse(afterDragDataset.isFirst) ? currentTreeNode.first = node : currentTreeNode.second = node;
                } else if( dragValue.shadowSection.type == 'RightHalf' ){
                    let afterDragDataset = dragValue.afterDrag.dom.dataset;
                    node.direction = 'row';

                    if( afterDragId == beforDragId ){
                        afterDragTreeNode.splitPercentage.percentage = 50;
                        afterDragTreeNode.direction = 'row';
                        mosaicPieceManager.mosaicWindows = [];
                        mosaicPieceManager.splits = [];
                        mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
                        return;
                    };

                    mosaicPieceManager.changeParentTreeByNode( exampleAppState.currentNode, beforDragTreeNode, dragValue.beforeDrag.isFirst );
                    
                    let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, afterDragDataset.nodeId );
                    let currentTreeNode = ( currentTree as IMosaicParent<T> );
                        
                    node.parentNodeId = afterDragDataset.nodeId;
                    JSON.parse(afterDragDataset.isFirst) ? currentTreeNode.first = node : currentTreeNode.second = node;
                } else if( dragValue.shadowSection.type == 'BottomHalf' ){
                    let afterDragDataset = dragValue.afterDrag.dom.dataset;
                    node.direction = 'column';

                    if( afterDragId == beforDragId ){
                        afterDragTreeNode.splitPercentage.percentage = 50;
                        afterDragTreeNode.direction = 'column';
                        mosaicPieceManager.mosaicWindows = [];
                        mosaicPieceManager.splits = [];
                        mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
                        return;
                    };

                    mosaicPieceManager.changeParentTreeByNode( exampleAppState.currentNode, beforDragTreeNode, dragValue.beforeDrag.isFirst );
                    
                    let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, afterDragDataset.nodeId );
                    let currentTreeNode = ( currentTree as IMosaicParent<T> );
                        
                    node.parentNodeId = afterDragDataset.nodeId;
                    JSON.parse(afterDragDataset.isFirst) ? currentTreeNode.first = node : currentTreeNode.second = node;
                } else if( dragValue.shadowSection.type == 'LeftHalf' ){
                    let afterDragDataset = dragValue.afterDrag.dom.dataset;
                    node.direction = 'row';

                    if( afterDragId == beforDragId ){
                        afterDragTreeNode.splitPercentage.percentage = 50;
                        afterDragTreeNode.direction = 'row';
                        mosaicPieceManager.mosaicWindows = [];
                        mosaicPieceManager.splits = [];
                        mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
                        return;
                    };

                    mosaicPieceManager.changeParentTreeByNode( exampleAppState.currentNode, beforDragTreeNode, dragValue.beforeDrag.isFirst );
                    
                    let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, afterDragDataset.nodeId );
                    let currentTreeNode = ( currentTree as IMosaicParent<T> );
                        
                    node.parentNodeId = afterDragDataset.nodeId;
                    JSON.parse(afterDragDataset.isFirst) ? currentTreeNode.first = node : currentTreeNode.second = node;
                } else {
                    dragValue.beforeDrag.tree.splitPercentage.percentage = dragValue.beforeDrag.splitPercentage;
                };

                mosaicPieceManager.mosaicWindows = [];
                mosaicPieceManager.splits = [];
                mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
            }
        },
        split:{
            positionChange: function<T extends TMosaicKey>( e, split: SplitTs<T> ){
                function mousemove(mousemoveEvent: MouseEvent){
                    let headerHeight = document.getElementsByClassName( 'svelte-mosaic-header' )[0].clientHeight;
                    let mousePosition = 0;
                    // ????????? ????????? ????????? ??????.
                    // ??????????????? ?????? splitPercentage??? ????????? ????????? ?????? ???????????? ????????? ??????
                    if( split.direction == 'row' ){
                        mousePosition = mousemoveEvent.clientX / document.body.offsetWidth * 100;
                    } else {
                        mousePosition = mousemoveEvent.clientY / document.body.offsetHeight * 100;
                    };

                    let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, split.id );
                    let currentTreeNode = ( currentTree as IMosaicParent<T> );
                    let splitPercentageSubtract = 0;
                    
                    if( splitMouseValue.id == '' || splitMouseValue.id != split.id ){
                        splitMouseValue.id = split.id;
                        splitMouseValue.percentage = mousePosition;
                    };

                    splitPercentageSubtract = splitMouseValue.percentage - mousePosition;

                    if( splitMouseValue.id == split.id ){
                        splitMouseValue.percentage = mousePosition;
                    };

                    if( currentTreeNode.splitPercentage.percentage - splitPercentageSubtract > 20 && currentTreeNode.splitPercentage.percentage - splitPercentageSubtract < 80 ){
                        currentTreeNode.splitPercentage.percentage -= splitPercentageSubtract;
                    };

                    setTreeAndPiecesSplitPercentageByTree2( currentTree, currentTreeNode.direction, splitPercentageSubtract );
                    // setTreeAndPiecesSplitPercentageByTree( currentTree, currentTreeNode.direction, splitPercentageSubtract );
                };

                window.addEventListener('mousemove', mousemove);

                window.addEventListener('mouseup', (mouseupEvent) => {
                    window.removeEventListener('mousemove', mousemove)
                });
            }
        },
        shadow: {
            dragOver: function( e ){
                e.dataTransfer.dropEffect = 'move';
                e.preventDefault();
            },
            dragEnter( e ){
                let shadow = document.getElementById( 'drop-target-container' );
                let shadowSection: Section = dragValue.targetSection.getShadowSectionByXY( e.clientX, e.clientY );
                let insetArr = dragValue.targetSection.getShawdowSecionInsetByShadowSection( shadowSection, dragValue.afterDrag.dom );

                let insetStr = `${insetArr[0]}% ${insetArr[1]}% ${insetArr[2]}% ${insetArr[3]}% `;

                shadow.style.inset = insetStr;

                dragValue.shadowSection = shadowSection;
                e.preventDefault();
            }
        }
    }

    function isParent<T extends TMosaicKey>( node: TMosaicNode<T> ): node is IMosaicParent<T> {
        return (node as IMosaicParent<T>).id != null;
    };

    function setTreeAndPiecesSplitPercentageByTree2<T extends TMosaicKey>( tree: TMosaicNode<T>, direction: TMosaicDirection, splitPercentageSubtract: number, parentTree?:TMosaicNode<T>, isFirst? :boolean ){
        if( !isParent( tree ) ){
            return;
        };

        let treeNode = ( tree as IMosaicParent<T> );

        if( parentTree ){
            let parentTreeNode = ( parentTree as IMosaicParent<T> );
            if( isFirst ){
                treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.firstInset;
            } else {
                treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.secondInset;
            }
        }

        // splitPercentageSubtract ??? ?????? ????????? ??????. ????????? ?????? ?????? ????????? ??????.
        // if( 
        //     (treeNode.splitPercentage.percentage - splitPercentageSubtract) > 45 ||
        //     (treeNode.splitPercentage.percentage - splitPercentageSubtract) < 55
        //     ){
        //     console.log(tree)
        //     console.log('@@@@@@@@@@@@@@@@@@@@@@@@');
        //     console.log(treeNode.splitPercentage.percentage);
        //     console.log(treeNode.splitPercentage.percentage + splitPercentageSubtract);
        // }

        let firstAndSecondInset = Inset.getFirstAndSecondInsetByTree( tree );
        treeNode.splitPercentage.firstInset = firstAndSecondInset.first;
        treeNode.splitPercentage.secondInset = firstAndSecondInset.second;

        let currentSplitIndex = mosaicPieceManager.splits.findIndex(function( split ){
            return split.id == treeNode.id;
        });
        let currentSplit = mosaicPieceManager.splits[ currentSplitIndex ];
        currentSplit.splitPercentage.inset = treeNode.splitPercentage.secondInset;
        
        // second ??? window ?????????
        // '???????' ?????? ??????. ?????? ??? ?????? ????????? ?????? ??????
        let currentMosaicIndexSecond = mosaicPieceManager.mosaicWindows.findIndex(function( mosaicWindow ){
            return (mosaicWindow.id == treeNode.id) && !mosaicWindow.isFirst;
        });

        let firstWindow = mosaicPieceManager.getFisrstMosaicWindowById( treeNode.id );
        let secondWindow = mosaicPieceManager.getSecondMosaicWindowById( treeNode.id );

        // firstWindow
        if( firstWindow ){
            firstWindow.splitPercentage.inset = treeNode.splitPercentage.firstInset;
        }

        // secondWindow
        if( secondWindow ){
            // ????????? ????????? ???????????? ?????? ?????? ??? ?????? ?????? ???????????? ???????????? ??????
            // ??????? - ?????? ????????? ?????? ?????? ?????? ??????? ?????? ?????? ???????
            mosaicPieceManager.mosaicWindows[ currentMosaicIndexSecond ].splitPercentage.inset = treeNode.splitPercentage.secondInset;
        }

        setTreeAndPiecesSplitPercentageByTree2( treeNode.first, direction, splitPercentageSubtract, tree, true );
        setTreeAndPiecesSplitPercentageByTree2( treeNode.second, direction, splitPercentageSubtract, tree, false );
    };

    function setTreeAndPiecesSplitPercentageByTree<T extends TMosaicKey>( tree: TMosaicNode<T>, direction: TMosaicDirection, splitPercentageSubtract: number, parentTree?:TMosaicNode<T>, isFirst? :boolean ){
        if( !isParent( tree ) ){
            return;
        };

        let treeNode = ( tree as IMosaicParent<T> );

        // ????????? ????????? ?????? ?????? ?????? ?????? ???????????? inset??? ?????? ??? ????????? ??????.
        if( parentTree ){
            let parentTreeNode = ( parentTree as IMosaicParent<T> );
            if( isFirst ){
                treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.firstInset;
            } else {
                treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.secondInset;
            }
        }

        // splitPercentageSubtract ??? ?????? ????????? ??????. ????????? ?????? ?????? ????????? ??????.
        // if( 
        //     (treeNode.splitPercentage.percentage - splitPercentageSubtract) > 45 ||
        //     (treeNode.splitPercentage.percentage - splitPercentageSubtract) < 55
        //     ){
        //     console.log(tree)
        //     console.log('@@@@@@@@@@@@@@@@@@@@@@@@');
        //     console.log(treeNode.splitPercentage.percentage);
        //     console.log(treeNode.splitPercentage.percentage + splitPercentageSubtract);
        // }

        if( direction == treeNode.direction ){
            treeNode.splitPercentage.percentage = treeNode.splitPercentage.percentage - splitPercentageSubtract;
        };
        
        let firstAndSecondInset = Inset.getFirstAndSecondInsetByTree( tree );
        treeNode.splitPercentage.firstInset = firstAndSecondInset.first;
        treeNode.splitPercentage.secondInset = firstAndSecondInset.second;

        let currentSplitIndex = mosaicPieceManager.splits.findIndex(function( split ){
            return split.id == treeNode.id;
        });
        let currentSplit = mosaicPieceManager.splits[ currentSplitIndex ];
        currentSplit.splitPercentage.inset = treeNode.splitPercentage.secondInset;
        
        // second ??? window ?????????
        // '???????' ?????? ??????. ?????? ??? ?????? ????????? ?????? ??????
        let currentMosaicIndexSecond = mosaicPieceManager.mosaicWindows.findIndex(function( mosaicWindow ){
            return (mosaicWindow.id == treeNode.id) && !mosaicWindow.isFirst;
        });

        let firstWindow = mosaicPieceManager.getFisrstMosaicWindowById( treeNode.id );
        let secondWindow = mosaicPieceManager.getSecondMosaicWindowById( treeNode.id );

        // firstWindow
        if( firstWindow ){
            if( direction == firstWindow.direction ){
                firstWindow.splitPercentage.percentage += splitPercentageSubtract;
            };
            firstWindow.splitPercentage.inset = treeNode.splitPercentage.firstInset;
        }

        // secondWindow
        if( secondWindow ){
            if( direction == secondWindow.direction ){
                secondWindow.splitPercentage.percentage += splitPercentageSubtract;
            };
            // ????????? ????????? ???????????? ?????? ?????? ??? ?????? ?????? ???????????? ???????????? ??????
            // ??????? - ?????? ????????? ?????? ?????? ?????? ??????? ?????? ?????? ???????
            mosaicPieceManager.mosaicWindows[ currentMosaicIndexSecond ].splitPercentage.inset = treeNode.splitPercentage.secondInset;
        }

        setTreeAndPiecesSplitPercentageByTree( treeNode.first, direction, splitPercentageSubtract, tree, true );
        setTreeAndPiecesSplitPercentageByTree( treeNode.second, direction, splitPercentageSubtract, tree, false );
    };

    let splitMouseValue = {
        id: '',
        percentage: 0
    };

    let dragValue = {
        // window dragStart ????????? ?????? ?????? ?????? ?????? ??????
        beforeDrag: {
            id: '',
            parentId: '',
            splitPercentage: null,
            tree: null,
            isFirst: null,
            selectedDom: null
        },
        // window dragEnter??? ??? ?????? ?????? ?????? ??????
        afterDrag: {
            dom: null
        },
        // window dragEnter??? ??? ?????? ?????? ????????? ????????? ??????
        targetSection: null,
        // ?????? shadow??? section??? ?????? ???
        shadowSection: {type:null}
    };

    let dragFunction = {
        setPiecesSplitPercentageByTree: function<T extends TMosaicKey>( tree: TMosaicNode<T>, dom, isFirst? :boolean, parentTree?:TMosaicNode<T> ){
            if( !isParent( tree ) ){
                return;
            };

            let treeNode = ( tree as IMosaicParent<T> );
            if( parentTree ){
                let parentTreeNode = ( parentTree as IMosaicParent<T> );
                if( isFirst ){
                    treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.firstInset;
                } else {
                    treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.secondInset;
                }
            };

            if( dom ){
                isFirst ? treeNode.splitPercentage.percentage = 0 : treeNode.splitPercentage.percentage = 100;
                let tempTree = {...tree};
                let tempTreeNode = ( tempTree as IMosaicParent<T> );
                let firstAndSecondInset = Inset.getFirstAndSecondInsetByTree( tempTree );
                tempTreeNode.splitPercentage.firstInset = firstAndSecondInset.first;
                tempTreeNode.splitPercentage.secondInset = firstAndSecondInset.second;

                let currentSplitIndex = mosaicPieceManager.splits.findIndex(function( split ){
                    return split.id == tempTreeNode.id;
                });
                let currentSplit = mosaicPieceManager.splits[ currentSplitIndex ];
                currentSplit.splitPercentage.inset = tempTreeNode.splitPercentage.secondInset;
                
                let currentWindowIndexFirst = mosaicPieceManager.mosaicWindows.findIndex(function( mosaicWindow ){
                    return (mosaicWindow.id == tempTreeNode.id) && mosaicWindow.isFirst;
                });
                let currentMosaicIndexSecond = mosaicPieceManager.mosaicWindows.findIndex(function( mosaicWindow ){
                    return (mosaicWindow.id == tempTreeNode.id) && !mosaicWindow.isFirst;
                });

                let firstWindow = mosaicPieceManager.getFisrstMosaicWindowById( tempTreeNode.id );
                let secondWindow = mosaicPieceManager.getSecondMosaicWindowById( tempTreeNode.id );

                // firstWindow
                if( firstWindow ){
                    if( isFirst ){
                        dom.style.opacity = 0.5;
                        dom.style.zIndex = 2;
                    } else {
                        firstWindow.splitPercentage.inset = tempTreeNode.splitPercentage.firstInset;
                    }
                };

                // secondWindow
                if( secondWindow ){
                    if( !isFirst ){
                        dom.style.opacity = 0.5;
                        dom.style.zIndex = 2;
                    } else {
                        mosaicPieceManager.mosaicWindows[ currentMosaicIndexSecond ].splitPercentage.inset = tempTreeNode.splitPercentage.secondInset;
                    }
                };


                dragFunction.setPiecesSplitPercentageByTree( treeNode.first, null, true, tempTree );
                dragFunction.setPiecesSplitPercentageByTree( treeNode.second, null, false, tree );

                return;
            }

            let firstAndSecondInset = Inset.getFirstAndSecondInsetByTree( tree );
            treeNode.splitPercentage.firstInset = firstAndSecondInset.first;
            treeNode.splitPercentage.secondInset = firstAndSecondInset.second;

            let currentSplitIndex = mosaicPieceManager.splits.findIndex(function( split ){
                return split.id == treeNode.id;
            });
            let currentSplit = mosaicPieceManager.splits[ currentSplitIndex ];
            currentSplit.splitPercentage.inset = treeNode.splitPercentage.secondInset;

            let currentMosaicIndexSecond = mosaicPieceManager.mosaicWindows.findIndex(function( mosaicWindow ){
                return (mosaicWindow.id == treeNode.id) && !mosaicWindow.isFirst;
            });

            let firstWindow = mosaicPieceManager.getFisrstMosaicWindowById( treeNode.id );
            let secondWindow = mosaicPieceManager.getSecondMosaicWindowById( treeNode.id );

            // firstWindow
            if( firstWindow ){
                firstWindow.splitPercentage.inset = treeNode.splitPercentage.firstInset;
            };

            // secondWindow
            if( secondWindow ){
                mosaicPieceManager.mosaicWindows[ currentMosaicIndexSecond ].splitPercentage.inset = treeNode.splitPercentage.secondInset;
            };

            dragFunction.setPiecesSplitPercentageByTree( treeNode.first, null, true, tree );
            dragFunction.setPiecesSplitPercentageByTree( treeNode.second, null, false, tree );
        },
        getFirstMosaicWindowIndexById( id: string ){
            let currentMosaicIndexFirst = mosaicPieceManager.mosaicWindows.findIndex(function( mosaicWindow ){
                return (mosaicWindow.id == id) && mosaicWindow.isFirst;
            });

            return currentMosaicIndexFirst;
        },
        getSecondMosaicWindowIndexById( id: string ){
            let currentMosaicIndexSecond = mosaicPieceManager.mosaicWindows.findIndex(function( mosaicWindow ){
                return (mosaicWindow.id == id) && !mosaicWindow.isFirst;
            });

            return currentMosaicIndexSecond;
        },
        getSplitIndexById( id: string ){
            let currentSplit = mosaicPieceManager.splits.findIndex(function( split ){
                return (split.id == id);
            });

            return currentSplit;
        },
        getMosaicWindowDomByDom( dom: HTMLElement ){
            if( dom.className.indexOf( 'mosaic-window' ) >= 0 ){
                if( dom.className.indexOf( 'mosaic-window-' ) >= 0 ){
                    dragFunction.getMosaicWindowDomByDom( dom.parentElement );
                } else {
                    return dom;
                };
            };

            let currentDom = dragFunction.getMosaicWindowDomByDom( dom.parentElement );
            return currentDom;
        },
        addNodeToTreeByValues<T extends TMosaicKey>( tree: TMosaicNode<T>, parentNodeId, nodeId, afterDragIsFirst, node: TMosaicNode<T>, parentTree?: TMosaicNode<T> ){
            let treeNode = ( tree as IMosaicParent<T> );
            let parentTreeNode = ( parentTree as IMosaicParent<T> );
            if( !isParent( tree ) ){
                if( 
                    parentTreeNode.parentNodeId == parentNodeId 
                    && parentTreeNode.id == nodeId
                ){
                    let _node = ( node as IMosaicParent<T> );
                    _node.parentNodeId = parentTreeNode.id;
                    if( afterDragIsFirst ){
                        parentTreeNode.first = node;
                    } else {
                        parentTreeNode.second = node;
                    }
                };
                return;
            };
            

            dragFunction.addNodeToTreeByValues( treeNode.first, parentNodeId, nodeId, afterDragIsFirst, node, tree );
            dragFunction.addNodeToTreeByValues( treeNode.second, parentNodeId, nodeId, afterDragIsFirst, node, tree );
        }
    };
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
    <DropTargetContainer
        event = { event.shadow }
    ></DropTargetContainer>
</div>

<style>
    .mosaic {
        height: calc(100% - 60px);
        position: relative;
        background-color: #abb3bf;
    }
</style>