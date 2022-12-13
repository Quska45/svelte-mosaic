import type {
    TMosaicKey
} from '../types/types';

export type TMosaicDirection = 'row' | 'column';

export type TMosaicNode<T extends TMosaicKey> = IMosaicParent<T> | T;

export interface IMosaicParent<T extends TMosaicKey> {
    direction: TMosaicDirection;
    first: TMosaicNode<T>;
    second: TMosaicNode<T>;
    splitPercentage?: number;
};

export class MosaicNode<T extends TMosaicKey> implements IMosaicParent<T>{
    direction: TMosaicDirection;
    first: TMosaicNode<T>;
    second: TMosaicNode<T>;
    splitPercentage?: number;

    constructor(
        direction: TMosaicDirection,
        first: TMosaicNode<T>,
        second: TMosaicNode<T>,
        splitPercentage?: number
    ){
        this.direction = direction;
        this.first = first;
        this.second = second;
        this.splitPercentage = splitPercentage ? splitPercentage : 50;
    }

    /**
     * Returns `true` if `node` is a MosaicParent
     * node의 타입에 대해서 is, as를 사용해서 타입을 추론 할 수 있도록 해줬다.
     * 이런 식의 코딩이 얼마나 유효한지는 앞으로 더 써봐야 알 것 같다.
     * 이렇게 할바에는 그냥 타입스크립트를 안쓰는게 나은거 아닐까? 타입이 없어서 문제가 됐던 기억이 전혀 없는데...
     * @param node
     * @returns {boolean}
     */
    isParent<T extends TMosaicKey>( node: TMosaicNode<T> ): node is IMosaicParent<T> {
        return (node as IMosaicParent<T>).direction != null;
    };

    /**
     * Gets all leaves of `tree`
     * 재귀 함수. first / second에 IMosaicNode가 아닌 number만 남을 때 까지 계속 돈다.
     * 제네릭을 사용해서 정의한 type을 통해 인자에 해당하는 tree의 타입을 유동적으로 정할 수 있도록 했다.
     * @param tree
     * @returns {T[]}
     */
    getLeaves<T extends TMosaicKey>( tree: TMosaicNode<T> | null ): T[] {
        if( tree == null ){
            return [];
        } else if( this.isParent( tree ) ){
            return this.getLeaves( tree.first ).concat( this.getLeaves( tree.second ) );
        } else {
            return [ tree ];
        }
    };

    static nodeToArray( node: TMosaicNode<number> ): []{
        
        return [];
    }
};