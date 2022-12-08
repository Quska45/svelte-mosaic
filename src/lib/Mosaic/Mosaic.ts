import type { IMosaicNode } from '../MosaicNode/MosaicNode'

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

export interface MosaicState {
    currentNode: IMosaicNode | null;
    lastInitialValue: IMosaicNode | null;
    mosaicId: string;
}