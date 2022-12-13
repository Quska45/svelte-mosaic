import type {
    TMosaicPath,
    TMosaicKey
} from '../types/types';
import type {
    IMosaicRootActions,
    IMosaicWindowActions
} from '../types/Actions';

/**
 * Context provided to everything within Mosaic
 */
export interface IMosaicBaseContext {
    alertChange( callback: Function ): boolean;
}
export interface IMosaicContext extends IMosaicBaseContext {
}
export interface IMosaicWindowContext extends IMosaicBaseContext {
}

/* 
    react-mosaic에서 MosaicContext의 역할.
    리액트에서는 MosaicContext, MosaicWindowContext의 값이 바뀔 때 마다 이를 구독하는 컴포넌트들이 변화를 감지한다.
    나도 위와 같은 기능이 구현되어야 한다.
*/
export class MosaicContext<T extends TMosaicKey> implements IMosaicContext {
    mosaicActions: IMosaicRootActions<T>;
    mosaicId: string;
    blueprintNamespace: string;

    /*
        context의 값이 변경 됐을 때 해당 context를 사용하는 모든 컴포넌트에서 리렌더링이 일어나야 함
        이를 위해 알림 역할을 하는 메서드
    */
    alertChange( callback: Function ): boolean{
        callback();
        return true;
    };
};

export class MosaicWindowContext implements IMosaicWindowContext {
    blueprintNamespace: string;
    mosaicWindowActions: IMosaicWindowActions;

    alertChange( callback: Function ): boolean{
        callback();
        return true;
    };
};