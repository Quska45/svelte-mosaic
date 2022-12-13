import type {
    MosaicNode
} from '../MosaicNode/MosaicNode';
import type {
    IMosaicRootActions
} from '../types/Actions';
import type {
    TMosaicPath,
    TMosaicKey
} from '../types/types';
import type {
    TMosaicNode
} from '../types/TMosaicNode';
import { MosaicContext, type IMosaicContext } from '../MosaicContext/MosaicContext';
import { v4 as uuid } from 'uuid';

/*
    react-mosaic에서 이 컴포넌트는 리액트 컴포넌트를 사용해 처리하고 있다.
    dnd를 위한 컴포넌트의 최초 세팅도 여기서 하고 있는데, 나도 여기서 처리할 수 있도록 하려고 한다.
    리액트는 context를 활용해 ui의 변경이 일어나게 하지만 스벨트는 어떻게 처리하는지 아직 잘 모르는 부분이 있으니 이건 해결해야할 과제다.
*/
export class DefaultProps {
    zeroStateView: null = null;
    className: string = 'mosaic-blueprint-theme';
    blueprintNamespace: string = 'bp3';

    onChange = () => {};
}

export interface IMosaicState {
}

export class MosaicState<T extends TMosaicKey> {
    currentNode: TMosaicNode<T> | null;
    lastInitialValue: TMosaicNode<T> | null;
    mosaicId: string;
}

export class MosaicWithoutDragDropContext<T extends TMosaicKey> {
    static defaultProps: DefaultProps = new DefaultProps();
    state: IMosaicState;
    masicId: 'string';
    actions: IMosaicRootActions<T>;
    childContext: IMosaicContext = new MosaicContext();

    constructor( state: IMosaicState, mosaicId: 'string' | null ){
        this.state = state;
        this.masicId = mosaicId != null  ? mosaicId : uuid();
    }

    getRoot<T extends TMosaicKey>(): TMosaicNode<T> | null {
        return null;
    };
    updateRoot( update, suppressOnRelease: boolean = false ): void {
    };
    replaceRoot<T extends TMosaicKey>( currentNode: TMosaicNode<T> | null, suppressOnRelease: boolean = false ): void {
    };
    rederTree(){
    };
    validateTree(){
    };
}

export class MosaicRootActions<T extends TMosaicKey> implements IMosaicRootActions<T> {
    expand: (path: TMosaicPath, percentage?: number) => void;
    remove: (path: TMosaicPath) => {};
    hide: (path: TMosaicPath) => void;
    replaceWith: () => void;
    getRoot: <T extends TMosaicKey>() => TMosaicNode<T> | null;
}