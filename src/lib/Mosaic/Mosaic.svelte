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
            mouseUp: function( e ){
                let currentMosaicWindowDom = dragFunction.getMosaicWindowDomByDom( e.target );
            },
            /**
             * dragStart 이벤트는 기존의 돔을 조정하는 역할만 한다.
             * 드래그의 대상과 해당 노드의 split의 inset을 100으로 만들어 준다.
             * 드래그 대상의 하위 노드들의 inset을 대상이 사라진 위치까지 꽉 채워 준다.
             * dragover가 실행되면서 shadow가 실제 dnd 역할을 수행하기 전에 필요한 것만 처리함. 
            */
            dragStart: function<T extends TMosaicKey>( e, mosaicWindow: MosaicNode<T> ){
                let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, mosaicWindow.id );
                let currentWindowIndex = mosaicWindow.isFirst ? dragFunction.getFisrstMosaicWindowIndexById( mosaicWindow.id ) : dragFunction.getSecondMosaicWindowIndexById( mosaicWindow.id );
                let currentWindow = mosaicPieceManager.mosaicWindows[ currentWindowIndex ];

                // e.target.parentElement.parentElement.style.opacity = 0;

                let parentTreeNode = ( currentWindow.parentTree as IMosaicParent<T> );

                // 드래그가 시작된 시점의 정보들을 가지고 있는다.
                dragValue.beforeDrag.splitPercentage = parentTreeNode.splitPercentage.percentage;
                dragValue.beforeDrag.tree = currentWindow.parentTree;
                dragValue.beforeDrag.isFirst = mosaicWindow.isFirst;
                dragValue.beforeDrag.id = mosaicWindow.id;
                dragValue.beforeDrag.parentId = mosaicWindow.parentNodeId;
                
                // 하위 window split의 resize 로직
                dragFunction.setPiecesSplitPercentageByTree( currentTree, e.target.parentElement.parentElement, currentWindow.isFirst );

                // 참조 값으로 속성값을 제어할 때 스벨트가 렌더링을 해주지 않는 현상이 계속 있음. 진짜로 왜?
                let currentSplitIndex = dragFunction.getSplitIndexById( mosaicWindow.id );
                mosaicPieceManager.splits[ currentSplitIndex ].isDisplay = 'none';

                dragValue.beforeDrag.selectedDom = e.target.parentElement.parentElement;

                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData( 'mosaicWindow', JSON.stringify(mosaicWindow) );
            },
            drop: function( e ){
            },
            // enter, over가 완전히 동일한 로직을 가지게 됨. 이거 개선 해야함
            dragOver: function( e ){
                let currentMosaicWindowDom = dragFunction.getMosaicWindowDomByDom( e.target );
                dragValue.beforeDrag.selectedDom.style.zIndex = -1;
                
                let dataset = currentMosaicWindowDom.dataset;
                // 드래그를 시작했을 때 선택됨 dom에 dragenter 되면 종료
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
                console.log(boundingRect);
                let targetSection = new TargetSection( boundingRect.left, boundingRect.top, boundingRect.right, boundingRect.bottom, 'TargetSection' );
                targetSection.setSectionList();
                dragValue.targetSection = targetSection;

                let shadowSection: Section = dragValue.targetSection.getShadowSectionByXY( e.clientX, e.clientY );
                if( shadowSection.type == 'empty' ){
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
                
                let dataset = currentMosaicWindowDom.dataset;
                // 드래그를 시작했을 때 선택됨 dom에 dragenter 되면 종료
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
                console.log(boundingRect);
                let targetSection = new TargetSection( boundingRect.left, boundingRect.top, boundingRect.right, boundingRect.bottom, 'TargetSection' );
                targetSection.setSectionList();
                dragValue.targetSection = targetSection;

                let shadowSection: Section = dragValue.targetSection.getShadowSectionByXY( e.clientX, e.clientY );
                if( shadowSection.type == 'empty' ){
                    return;
                }

                shadow.style.display = 'block';
                shadow.style.zIndex = '10';
                shadow.style.inset = `${currentMosaicWindowDom.style.inset}`;

                dragValue.afterDrag.dom = currentMosaicWindowDom;
            },
            dragEnd: function<T extends TMosaicKey>( e ){
                let currentMosaicWindowDom = dragFunction.getMosaicWindowDomByDom( e.target );
                let shadow = document.getElementById( 'drop-target-container' );

                dragValue.beforeDrag.selectedDom.style.zIndex = 0;
                dragValue.beforeDrag.selectedDom.style.opacity = 1;
                
                shadow.style.display = 'none';
                shadow.style.zIndex = '-1';

                mosaicPieceManager.mosaicWindows = [];
                mosaicPieceManager.splits = [];

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

                // 바뀐 정보로 리렌더링이 일어날 수 있도록 배열을 새로 만든다.
                

                // 돔을 원상태로 복구 하는 코드
                dragValue.beforeDrag.tree.splitPercentage.percentage = dragValue.beforeDrag.splitPercentage;
                mosaicPieceManager.makeWindowsAndSplitsBySearchTree( exampleAppState.currentNode );
            }
        },
        split:{
            positionChange: function<T extends TMosaicKey>( e, split: SplitTs<T> ){
                function mousemove(mousemoveEvent){
                    let mousePosition = 0;
                    // 비율을 이렇게 구하면 안됨.
                    // 최상위에서 구한 splitPercentage의 비율은 하위에 있는 노드들과 다르기 때문
                    if( split.direction == 'row' ){
                        mousePosition = mousemoveEvent.clientX / document.body.offsetWidth * 100;
                    } else {
                        mousePosition = mousemoveEvent.clientY / (document.body.offsetHeight + 60) * 100;
                    }
                    let currentTree = mosaicPieceManager.getTreeByNodeId( exampleAppState.currentNode, split.id );
                    let currentTreeNode = ( currentTree as IMosaicParent<T> );
                    let splitPercentageSubtract = currentTreeNode.splitPercentage.percentage - mousePosition;
                    
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
            },
            dragEnter( e ){
                let shadow = document.getElementById( 'drop-target-container' );
                let shadowSection: Section = dragValue.targetSection.getShadowSectionByXY( e.clientX, e.clientY );
                let insetArr = dragValue.targetSection.getShawdowSecionTypeByShadowSection( shadowSection, dragValue.afterDrag.dom );

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
        // window dragStart 시작된 순간 해당 돔에 대한 정보
        beforeDrag: {
            id: '',
            parentId: '',
            splitPercentage: null,
            tree: null,
            isFirst: null,
            selectedDom: null
        },
        // window dragEnter가 된 순간 돔에 대한 정보
        afterDrag: {
            dom: null
        },
        // window dragEnter가 된 순간 돔의 영역과 관련된 정보
        targetSection: null,
        // 현재 shadow의 section에 대한 값
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
        background-color: #abb3bf;
    }
</style>