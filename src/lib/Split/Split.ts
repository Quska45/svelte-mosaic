import type { Inset } from '../Common/Inset';
import { MosaicPiece } from '../Common/MosaicPiece';
import type { IMosaicParent, TMosaicDirection, TMosaicNode } from '../MosaicNode/MosaicNode';
import type { TMosaicKey } from '../types/types';
export class Split<T extends TMosaicKey> extends MosaicPiece<T> {

    constructor(){
        super();
    }
}