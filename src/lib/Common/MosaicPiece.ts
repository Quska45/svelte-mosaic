import type { IMosaicParent, SplitPercentage, TMosaicDirection, TMosaicNode } from "../MosaicNode/MosaicNode";
import type { TMosaicKey } from "../types/types";
import type { Inset } from "./Inset";

export class MosaicPiece<T extends TMosaicKey> {
    id: string;
    parentNodeId: string | null;
    inset: Inset<T>;
    isDisplay: boolean;
    onDraging: boolean;
    direction: TMosaicDirection;
    splitPercentage: SplitPercentage;
    tree: TMosaicNode<T>;
    parentTree: TMosaicNode<T>;
}