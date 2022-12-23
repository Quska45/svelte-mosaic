import type { TMosaicNode } from '../MosaicNode/MosaicNode'
import type { TMosaicKey } from '../types/types';

export interface IMosaicBaseProps {
    isUnControlled(): boolean;
};

export interface IMosaicControlledProps extends MosaicBaseProps {
    
};

export interface IMosaicUncontrolledProps extends MosaicBaseProps {

};

export class MosaicBaseProps implements IMosaicBaseProps {

    isUnControlled(): boolean {
        return true;
    }
};

export class MosaicControlledProps extends MosaicBaseProps implements IMosaicControlledProps {

};

export class MosaicUncontrolledProps extends MosaicBaseProps implements IMosaicUncontrolledProps {
    
};

export type TMosaicProps = IMosaicControlledProps | IMosaicUncontrolledProps;

export interface MosaicState<T extends TMosaicKey> {
    currentNode: TMosaicNode<T> | null;
    lastInitialValue: TMosaicNode<T> | null;
    mosaicId: string;
}

export const renderer = {
    
}