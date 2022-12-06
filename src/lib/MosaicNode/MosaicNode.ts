import type {
    TMosaicDirection,
    TMosaicNode
} from '../types/MosaicNode';

// export interface IMosaicNode {
//     direction: TMosaicDirection;
//     first: TMosaicNode;
//     second: TMosaicNode;
//     splitPercentage: number;
// };

export class MosaicNode {
    direction: TMosaicDirection;
    first: TMosaicNode;
    second: TMosaicNode;
    splitPercentage: number;
};