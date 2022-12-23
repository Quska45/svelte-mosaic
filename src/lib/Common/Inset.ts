import type { IMosaicParent, MosaicNode, SplitPercentage, TMosaicDirection, TMosaicNode } from "../MosaicNode/MosaicNode";
import type { TMosaicKey } from "../types/types";

export type TInset = IInset;
export interface IInset {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

/**
 * 클래스가 아니라 유틸의 형태로 제공되어야 할듯.
 * 타입으로 관리되는 객체의 메서드를 정의하는 부분을 어떤 식으로 처리 할지에 대해서 아이디어가 필요한 듯
*/
export class Inset<T extends TMosaicKey>{
    constructor(){
    };

    static getFirstAndSecondInsetByTree<T extends TMosaicKey>( tree: TMosaicNode<T> ){
        let treeNode = ( tree as IMosaicParent<T> );
        const absolutePercentage = Inset.getAbsoluteSplitPercentage( tree );

        if( treeNode.direction == 'row' ){
            return {
                first: {
                    ...treeNode.splitPercentage.inset,
                    right: 100 - absolutePercentage
                },
                second: {
                    ...treeNode.splitPercentage.inset,
                    left: absolutePercentage
                }
            }
        } else {
            return {
                first: {
                    ...treeNode.splitPercentage.inset,
                    bottom: 100 - absolutePercentage
                },
                second: {
                    ...treeNode.splitPercentage.inset,
                    top: absolutePercentage
                }
            }
        }
    };

    static getAbsoluteSplitPercentage<T extends TMosaicKey>( tree: TMosaicNode<T> ): number{
        let treeNode = ( tree as IMosaicParent<T> );
        let inset = treeNode.splitPercentage.inset;
        if( treeNode.direction == 'row' ){
            const width = 100 - inset.right - inset.left;
            return (width * treeNode.splitPercentage.percentage) / 100 + inset.left;
        } else {
            const height = 100 - inset.top - inset.bottom;
            return ( height * treeNode.splitPercentage.percentage ) / 100 + inset.top;
        }
    }
};