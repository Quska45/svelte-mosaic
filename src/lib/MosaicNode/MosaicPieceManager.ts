import { v4 as uuid } from 'uuid';
import { Inset } from "../Common/Inset";
import { Split } from "../Split/Split";
import type { TMosaicKey } from "../types/types";
import { MosaicNode, SplitPercentage, type IMosaicParent, type TMosaicDirection, type TMosaicNode } from "./MosaicNode";

export class MosaicPieceManager<T extends TMosaicKey> {
    mosaicWindows: MosaicNode<T>[] = [];
    splits: Split<T>[] = [];

    constructor(){
    };

    isParent<T extends TMosaicKey>( node: TMosaicNode<T> ): node is IMosaicParent<T> {
        return (node as IMosaicParent<T>).id != null;
    };

    makeWindowsAndSplitsBySearchTree( tree: TMosaicNode<T> ) {
        let treeNode = ( tree as IMosaicParent<T> );
        let parentTree: TMosaicNode<T> = tree;

        // 마스터 노드인 경우에 대해 inset 값 세팅
        treeNode.splitPercentage.inset = { top: 0, right: 0, bottom: 0, left: 0 };
        let firstAndSecondInset = Inset.getFirstAndSecondInsetByTree( tree );
        treeNode.splitPercentage.firstInset = firstAndSecondInset.first;
        treeNode.splitPercentage.secondInset = firstAndSecondInset.second;

        // split에 사용할 split만 생성함
        let split = this.getSplitObjByTree( tree, parentTree );
        this.splits.push( split );
        this.makeWindowsAndSplitsBySearchTreeRecursively( treeNode.first, parentTree, true );
        this.makeWindowsAndSplitsBySearchTreeRecursively( treeNode.second, parentTree, false );
    };

    makeWindowsAndSplitsBySearchTreeRecursively( tree: TMosaicNode<T>, parentTree: TMosaicNode<T>, isFirst: boolean ){
        let treeNode = ( tree as IMosaicParent<T> );
        let parentTreeNode = ( parentTree as IMosaicParent<T> );

        if( !this.isParent( tree ) ){
            let mosaicNode = this.getMosaicNodeObjByTree( tree, parentTree, isFirst );
            this.mosaicWindows.push( mosaicNode );
            return;
        };
        
        if( isFirst ){
            treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.firstInset;
        } else {
            treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.secondInset;
        };

        let firstAndSecondInset = Inset.getFirstAndSecondInsetByTree( tree );
        treeNode.splitPercentage.firstInset = firstAndSecondInset.first;
        treeNode.splitPercentage.secondInset = firstAndSecondInset.second;

        let split = this.getSplitObjByTree( tree, parentTree );
        this.splits.push( split );
        this.makeWindowsAndSplitsBySearchTreeRecursively( tree.first, tree, true );
        this.makeWindowsAndSplitsBySearchTreeRecursively( tree.second, tree, false );
    };

    setTreeAndPiecesSplitPercentageByTree<T extends TMosaicKey>( tree: TMosaicNode<T>, direction: TMosaicDirection, splitPercentageSubtract: number, parentTree?:TMosaicNode<T>, isFirst? :boolean ){
        let treeNode = ( tree as IMosaicParent<T> );

        if( !this.isParent( tree ) ){
            return;
        };

        if( parentTree ){
            let parentTreeNode = ( parentTree as IMosaicParent<T> );
            if( isFirst ){
                treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.firstInset;
            } else {
                treeNode.splitPercentage.inset = parentTreeNode.splitPercentage.secondInset;
            }
        }

        if( direction == treeNode.direction ){
            treeNode.splitPercentage.percentage = treeNode.splitPercentage.percentage - splitPercentageSubtract;
        };
        
        let firstAndSecondInset = Inset.getFirstAndSecondInsetByTree( tree );
        treeNode.splitPercentage.firstInset = firstAndSecondInset.first;
        treeNode.splitPercentage.secondInset = firstAndSecondInset.second;

        let currentSplitIndex = this.splits.findIndex(function( split ){
            return split.id == treeNode.id;
        });
        let currentSplit = this.splits[ currentSplitIndex ];
        currentSplit.splitPercentage.inset = treeNode.splitPercentage.secondInset;
        
        // first 인 window 찾아옴
        let currentMosaicIndexFirst = this.mosaicWindows.findIndex(function( mosaicWindow ){
            return (mosaicWindow.id == treeNode.id) && mosaicWindow.isFirst;
        });

        // second 인 window 찾아옴
        let currentMosaicIndexSecond = this.mosaicWindows.findIndex(function( mosaicWindow ){
            return (mosaicWindow.id == treeNode.id) && !mosaicWindow.isFirst;
        });

        // let firstWindow = mosaicPieceManager.mosaicWindows[ currentMosaicIndexFirst ];
        // let secondWindow = mosaicPieceManager.mosaicWindows[ currentMosaicIndexSecond ];
        let firstWindow = this.getFisrstMosaicWindowById( treeNode.id );
        let secondWindow = this.getSecondMosaicWindowById( treeNode.id );

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
            // secondWindow.splitPercentage.inset = treeNode.splitPercentage.secondInset;
            // secondWindow.splitPercentage.inset.top = treeNode.splitPercentage.secondInset.top;
            // secondWindow.splitPercentage.inset.right = treeNode.splitPercentage.secondInset.right;
            // secondWindow.splitPercentage.inset.bottom = treeNode.splitPercentage.secondInset.bottom;
            // secondWindow.splitPercentage.inset.left = treeNode.splitPercentage.secondInset.left;
            this.mosaicWindows[ currentMosaicIndexSecond ].splitPercentage.inset = treeNode.splitPercentage.secondInset;
        }

        console.log( treeNode.splitPercentage.firstInset );
        console.log( treeNode.splitPercentage.secondInset );

        this.setTreeAndPiecesSplitPercentageByTree( treeNode.first, direction, splitPercentageSubtract, tree, true );
        this.setTreeAndPiecesSplitPercentageByTree( treeNode.second, direction, splitPercentageSubtract, tree, false );
    };

    getTreeByNodeId( tree: TMosaicNode<T>, nodeId ){
        let treeNode = ( tree as IMosaicParent<T> );
        if( !this.isParent( tree ) ){
            return null; 
        };

        if( treeNode.id == nodeId ){
            return tree;
        };

        let targetTree1 = this.getTreeByNodeId( treeNode.first, nodeId );
        let targetTree2 = this.getTreeByNodeId( treeNode.second, nodeId );

        return targetTree1 ? targetTree1 : targetTree2;
    };

    changeParentTreeByNode( tree: TMosaicNode<T>, node: IMosaicParent<T>, isFirst ){
        if( !this.isParent( tree ) ){
            return null; 
        };

        if( ( tree.first as IMosaicParent<T>).id == node.id ){
            if(isFirst){
                tree.first = node.second;
            } else {
                tree.first = node.first;
            };
        };
        
        if( ( tree.second as IMosaicParent<T>).id == node.id ){
            if( isFirst ){
                tree.second = node.second;
            } else {
                tree.second = node.first;
            };
        };
        
        this.changeParentTreeByNode( tree.first, node, isFirst );
        this.changeParentTreeByNode( tree.second, node, isFirst );
    };

    getMosaicNodeObjByTree<T extends TMosaicKey>( tree: TMosaicNode<T>, parentTree: TMosaicNode<T>, isFirst: boolean ): MosaicNode<T>{
        let mosaicNode = new MosaicNode();
        let treeNode = ( tree as IMosaicParent<T> );
        let parentTreeNode = ( parentTree as IMosaicParent<T> );
        
        mosaicNode.id = parentTreeNode.id;
        mosaicNode.title = parentTreeNode.title;
        mosaicNode.parentNodeId = parentTreeNode.parentNodeId;
        mosaicNode.direction = parentTreeNode.direction;
        mosaicNode.isDisplay = 'block';
        mosaicNode.onDraging = false;
        mosaicNode.isFirst = isFirst;
        mosaicNode.tree = tree;
        mosaicNode.parentTree = parentTree;
        mosaicNode.splitPercentage = new SplitPercentage();
        mosaicNode.splitPercentage.percentage = mosaicNode.splitPercentage.percentage;

        let parentInset = isFirst ? parentTreeNode.splitPercentage.firstInset : parentTreeNode.splitPercentage.secondInset;
        mosaicNode.splitPercentage.inset = parentInset;
        
        return mosaicNode;
    };

    getSplitObjByTree<T extends TMosaicKey>( tree: TMosaicNode<T>, parentTree: TMosaicNode<T> ): Split<T>{
        let split = new Split();
        let treeNode = (tree as IMosaicParent<T>);
        let parentTreeNode = ( parentTree as IMosaicParent<T> );
        
        split.id = treeNode.id;
        split.parentNodeId = parentTreeNode.id;
        split.direction = treeNode.direction;
        split.isDisplay = 'block';
        split.onDraging = false;
        split.tree = tree;
        split.parentTree = parentTree;
        split.splitPercentage = new SplitPercentage();
        split.splitPercentage.percentage = treeNode.splitPercentage.percentage;
        split.splitPercentage.inset = treeNode.splitPercentage.secondInset;

        return split;
    };

    getFisrstMosaicWindowById( id: string ){
        let currentMosaicIndexFirst = this.mosaicWindows.findIndex(function( mosaicWindow ){
            return (mosaicWindow.id == id) && mosaicWindow.isFirst;
        });

        return this.mosaicWindows[ currentMosaicIndexFirst ];
    };

    getSecondMosaicWindowById( id: string ){
        let currentMosaicIndexSecond = this.mosaicWindows.findIndex(function( mosaicWindow ){
            return (mosaicWindow.id == id) && !mosaicWindow.isFirst;
        });

        return this.mosaicWindows[ currentMosaicIndexSecond ];
    };

    getNewTreeBySectionDirection( sectionDirection: string ){
        
    }
}