import type {
    TMosaicKey
} from '../types/types';
import { v4 as uuid } from 'uuid';
import type { Inset, TInset } from '../Common/Inset';
import { MosaicPiece } from '../Common/MosaicPiece';

export type TMosaicDirection = 'row' | 'column' | ''; // 최상위 노드는 방향이 없음

/**
 * splitPercentage는 first에 대한 값만 가지고 있다.
 * second는 first를 뺀 나머지와 같은 값을 가지게 된다.
*/
export class SplitPercentage {
    percentage?: number;
    inset?: TInset; // 상위노드에서 받은 현재 노드의 Inset
    firstInset?: TInset;
    secondInset?: TInset;
};

// mosaic에 사용할 초기 데이터에 사용되는 타입과 인터페이스
export type TMosaicNode<T extends TMosaicKey> = IMosaicParent<T> | MosaicNode<T> | T;

export interface IMosaicParent<T extends TMosaicKey> {
    id: string;
    title: string;
    direction: TMosaicDirection;
    parentNodeId: string | null; // null인 경우 마스터 노드
    first: TMosaicNode<T>;
    second: TMosaicNode<T>;
    splitPercentage: SplitPercentage;
};

// 실제 윈도우를 그리는 용도로 사용할 클래스
export class MosaicNode<T extends TMosaicKey> extends MosaicPiece<T>{
    title: string;
    isFirst: boolean;

    constructor() {
        super();
    };

    /**
     * Returns `true` if `node` is a MosaicParent
     * node의 타입에 대해서 is, as를 사용해서 타입을 추론 할 수 있도록 해줬다.
     * 이런 식의 코딩이 얼마나 유효한지는 앞으로 더 써봐야 알 것 같다.
     * 이렇게 할바에는 그냥 타입스크립트를 안쓰는게 나은거 아닐까? 타입이 없어서 문제가 됐던 기억이 전혀 없는데...
     * @param node
     * @returns {boolean}
     */
    static isParent<T extends TMosaicKey>( node: TMosaicNode<T> ): node is IMosaicParent<T> {
        return (node as IMosaicParent<T>).id != null;
    };
};