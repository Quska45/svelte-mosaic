import type {
    TMosaicPath
} from './types'

/**
 * Context provided to everything within Mosaic
 */
export interface MosaicContext {
    mosaicActions: MosaicRootActions;
    mosaicId: string;
    blueprintNamespace: string;
}

/**
 * These actions are used to alter the state of the view tree
 */
export interface MosaicRootActions {
    expand: ( path: TMosaicPath, percentage?: number ) => void;
}