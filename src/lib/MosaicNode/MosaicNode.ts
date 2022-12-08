import type {
    TMosaicDirection,
    TMosaicNode
} from '../types/TMosaicNode';

export interface IMosaicNode {
};

export class MosaicNode implements IMosaicNode{
    direction: TMosaicDirection;
    first: TMosaicNode;
    second: TMosaicNode;
    splitPercentage: number;

    constructor(
        direction: TMosaicDirection,
        first: TMosaicNode,
        second: TMosaicNode,
        splitPercentage: number
    ){
        this.direction = direction;
        this.first = first;
        this.second = second;
        this.splitPercentage = splitPercentage;
    }
};