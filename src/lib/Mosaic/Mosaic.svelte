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
    import type { IMosaicParent, MosaicNode, TMosaicDirection, TMosaicNode } from '../MosaicNode/MosaicNode';
    import type { TMosaicKey } from '../types/types';
    import { Inset } from '../Common/Inset';
    import DropTargetContainer from '../DropTargetContainer/DropTargetContainer.svelte';
    import { compute_rest_props } from 'svelte/internal';
    import { TargetSection } from './TargetSection';
    
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
                isFirst ? currentWindowIndex =  dragFunction.getFisrstMosaicWindowIndexById( currentTreeNode.id ) : currentWindowIndex =  dragFunction.getSecondMosaicWindowIndexById( currentTreeNode.id );

                let currentWindow = mosaicPieceManager.mosaicWindows[ currentWindowIndex ];
                let width = (100 - (currentWindow.splitPercentage.inset.left + currentWindow.splitPercentage.inset.right)) /2;
                let height = (100 - (currentWindow.splitPercentage.inset.top + currentWindow.splitPercentage.inset.bottom)) /2;
                width >= height ? node.direction = 'row' : node.direction = 'column';

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
            mouseDown: function<T extends TMosaicKey>( e, mosaicWindow: MosaicNode<T> ){
            },
            /**
             * dragStart 이벤트는 기존의 돔을 조정하는 역할만 한다.
             * 드래그의 대상과 해당 노드의 split의 inset을 100으로 만들어 준다.
             * 드래그 대상의 하위 노드들의 inset을 대상이 사라진 위치까지 꽉 채워 준다.
             * dragover가 실행되면서 shadow가 실제 dnd 역할을 수행하기 전에 필요한 것만 처리함. 
            */
            dragStart: function<T extends TMosaicKey>( e, mosaicWindow: MosaicNode<T> ){
                console.log('dragStart event');
                let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, mosaicWindow.id );
                let currentTreeNode = ( currentTree as IMosaicParent<T> );
                let currentWindowIndex = mosaicWindow.isFirst ? dragFunction.getFisrstMosaicWindowIndexById( mosaicWindow.id ) : dragFunction.getSecondMosaicWindowIndexById( mosaicWindow.id );
                let currentWindow = mosaicPieceManager.mosaicWindows[ currentWindowIndex ];

                // e.target.parentElement.parentElement.style.opacity = 0;

                let parentTreeNode = ( currentWindow.parentTree as IMosaicParent<T> );
                console.log(parentTreeNode);

                // 드래그가 시작된 시점의 정보들을 가지고 있는다.
                dragValue.beforeDrag.splitPercentage = parentTreeNode.splitPercentage.percentage;
                dragValue.beforeDrag.tree = currentWindow.parentTree;
                
                // 하위 window split의 resize 로직
                dragFunction.setPiecesSplitPercentageByTree( currentTree, e.target.parentElement.parentElement, currentWindow.isFirst );

                // 참조 값으로 속성값을 제어할 때 스벨트가 렌더링을 해주지 않는 현상이 계속 있음. 진짜로 왜?
                let currentSplitIndex = dragFunction.getSplitIndexById( mosaicWindow.id );
                mosaicPieceManager.splits[ currentSplitIndex ].isDisplay = 'none';

                dragValue.selectedDom = e.target.parentElement.parentElement;

                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData( 'mosaicWindow', JSON.stringify(mosaicWindow) );
            },
            drop: function( e ){
                console.log('drop event');
                console.log(JSON.parse(e.dataTransfer.getData( 'mosaicWindow' )));
            },
            dragOver: function( e ){
                console.log('drag over event');


            },
            dragEnd: function( e ){
                console.log('drag end event');
                // let $dropTargetContainer = document.getElementById( 'drop-target-container' );
                // let boundingRect = $dropTargetContainer.getBoundingClientRect();
                let shadow = document.getElementById( 'drop-target-container' );

                dragValue.selectedDom.style.zIndex = 0;
                dragValue.selectedDom.style.opacity = 1;
                
                shadow.style.display = 'none';
                shadow.style.zIndex = '-1';

                mosaicPieceManager.mosaicWindows = [];
                mosaicPieceManager.splits = [];
                console.log(exampleAppState.currentNode);
                console.log(dragValue.beforeDrag.tree);
                dragValue.beforeDrag.tree.splitPercentage.percentage = dragValue.beforeDrag.splitPercentage;
                mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
            },
            dragEnter: function( e ){
                console.log('drag enter event');
                e.dataTransfer.dropEffect = 'move';
                let shadow = document.getElementById( 'drop-target-container' );
                let currentMosaicWindowDom = dragFunction.getMosaicWindowDomByDom( e.target );
                let boundingRect = currentMosaicWindowDom.getBoundingClientRect();
                console.log(currentMosaicWindowDom);
                // console.log(currentMosaicWindowDom.clientWidth);
                // console.log(currentMosaicWindowDom.clientHeight);
                // console.log(currentMosaicWindowDom.clientX);
                // console.log(currentMosaicWindowDom.clientY);
                // let targetSection = new TargetSection( currentMosaicWindowDom.clientLeft, currentMosaicWindowDom.clientTop, currentMosaicWindowDom.clientWidth, currentMosaicWindowDom.clientHeight );
                let targetSection = new TargetSection( boundingRect.left, boundingRect.top, boundingRect.right, boundingRect.bottom );
                targetSection.setSectionList();
                dragValue.targetSection = targetSection;
                // dragValue.targetSection.setSectionLists();
                console.log(dragValue.targetSection);

                dragValue.selectedDom.style.zIndex = -1;
                shadow.style.display = 'block';
                shadow.style.zIndex = '10';
                shadow.style.inset = `${currentMosaicWindowDom.style.inset}`;
                // console.log(document.elementsFromPoint(e.clientX, e.clientY));
            }
        },
        split:{
            positionChange: function<T extends TMosaicKey>( e, split: SplitTs<T> ){
                function mousemove(mousemoveEvent){
                    let mousePosition = 0;
                    // 비율을 이렇게 구하면 안됨.
                    if( split.direction == 'row' ){
                        mousePosition = mousemoveEvent.clientX / document.body.offsetWidth * 100;
                    } else {
                        mousePosition = mousemoveEvent.clientY / (document.body.offsetHeight + 60) * 100;
                    }
                    let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, split.id );
                    let currentTreeNode = ( currentTree as IMosaicParent<T> );
                    console.log(mousePosition);
                    let splitPercentageSubtract = currentTreeNode.splitPercentage.percentage - mousePosition;
                    
                    // mosaicPieceManager.setTreeAndPiecesSplitPercentageByTree( currentTree, currentTreeNode.direction, splitPercentageSubtract );
                    setTreeAndPiecesSplitPercentageByTree( currentTree, currentTreeNode.direction, splitPercentageSubtract );
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
                console.log( 'shadow dragover event' );
            }
        }
    }

    function isParent<T extends TMosaicKey>( node: TMosaicNode<T> ): node is IMosaicParent<T> {
        return (node as IMosaicParent<T>).id != null;
    };

    function setTreeAndPiecesSplitPercentageByTree<T extends TMosaicKey>( tree: TMosaicNode<T>, direction: TMosaicDirection, splitPercentageSubtract: number, parentTree?:TMosaicNode<T>, isFirst? :boolean ){
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

        // splitPercentageSubtract 값 확인 해보는 용도. 이걸로 뭔가 처리 해줘야 할듯.
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
        
        // second 인 window 찾아옴
        // '버그?' 주석 참고. 어쩔 수 없이 구해야 하는 값임
        let currentMosaicIndexSecond = mosaicPieceManager.mosaicWindows.findIndex(function( mosaicWindow ){
            return (mosaicWindow.id == treeNode.id) && !mosaicWindow.isFirst;
        });

        // let firstWindow = mosaicPieceManager.mosaicWindows[ currentMosaicIndexFirst ];
        // let secondWindow = mosaicPieceManager.mosaicWindows[ currentMosaicIndexSecond ];
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
            // 버그? - 이게 어떻게 안될 수가 있는 거지? 진짜 버그 아님?
            // 완전히 동일한 참조값을 변경 했을 때 실제 돔에 렌더링이 일어나지 않음
            // secondWindow.splitPercentage.inset = treeNode.splitPercentage.secondInset;
            // secondWindow.splitPercentage.inset.top = treeNode.splitPercentage.secondInset.top;
            // secondWindow.splitPercentage.inset.right = treeNode.splitPercentage.secondInset.right;
            // secondWindow.splitPercentage.inset.bottom = treeNode.splitPercentage.secondInset.bottom;
            // secondWindow.splitPercentage.inset.left = treeNode.splitPercentage.secondInset.left;
            mosaicPieceManager.mosaicWindows[ currentMosaicIndexSecond ].splitPercentage.inset = treeNode.splitPercentage.secondInset;
        }

        setTreeAndPiecesSplitPercentageByTree( treeNode.first, direction, splitPercentageSubtract, tree, true );
        setTreeAndPiecesSplitPercentageByTree( treeNode.second, direction, splitPercentageSubtract, tree, false );
    };

    let dragValue = {
        beforeDrag: {
            id: '',
            splitPercentage: null,
            tree: null
        },
        targetSection: null,
        selectedDom: null
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
        getFisrstMosaicWindowIndexById( id: string ){
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
    }
</style>