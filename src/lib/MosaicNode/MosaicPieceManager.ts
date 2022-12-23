import { v4 as uuid } from 'uuid';
import { Inset } from "../Common/Inset";
import { Split } from "../Split/Split";
import type { TMosaicKey } from "../types/types";
import { MosaicNode, SplitPercentage, type IMosaicParent, type TMosaicDirection, type TMosaicNode } from "./MosaicNode";

export class MosaicPieceManager<T extends TMosaicKey> {
    mosaicWindows: MosaicNode<T>[] = [];
    splits: Split<T>[] = [];
    event = {
        split : ( tree: TMosaicNode<T>, isFirst: boolean ) => {
            let treeNode = ( tree as IMosaicParent<T> );
            let node: TMosaicNode<T> = {
                id: uuid(),
                title: 'newWindow',
                parentNodeId: treeNode.id,
                direction: 'row',
                first: ( 0 as TMosaicNode<T> ),
                second: ( 0 as TMosaicNode<T> ),
                splitPercentage: {
                    percentage: 50
                }
            };
            isFirst ? treeNode.first = node : treeNode.second = node;


        }
    };

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

    getMosaicNodeObjByTree<T extends TMosaicKey>( tree: TMosaicNode<T>, parentTree: TMosaicNode<T>, isFirst: boolean ): MosaicNode<T>{
        let mosaicNode = new MosaicNode();
        let treeNode = ( tree as IMosaicParent<T> );
        let parentTreeNode = ( parentTree as IMosaicParent<T> );
        
        mosaicNode.id = parentTreeNode.id;
        mosaicNode.title = parentTreeNode.title;
        mosaicNode.parentNodeId = parentTreeNode.parentNodeId;
        mosaicNode.direction = parentTreeNode.direction;
        mosaicNode.isDisplay = true;
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
        split.isDisplay = true;
        split.onDraging = false;
        split.tree = tree;
        split.parentTree = parentTree;
        split.splitPercentage = new SplitPercentage();
        split.splitPercentage.percentage = treeNode.splitPercentage.percentage;
        split.splitPercentage.inset = treeNode.splitPercentage.secondInset;

        return split;
    };
}