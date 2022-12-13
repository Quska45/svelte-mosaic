import type {
    TMosaicPath,
    TMosaicKey
} from './types';
import type {
    TMosaicNode
} from '../MosaicNode/MosaicNode';

/*
    root의 action과 window의 action은 다르다.
    분석이 필요함.
*/
/**
 * These actions are used to alter the state of the view tree
 */
 export interface IMosaicRootActions<T extends TMosaicKey> {
    /**
     * Increases the size of this node and bubbles up the tree
     * @param path Path to node to expand
     * @param percentage Every node in the path up to root will be expanded to this percentage
     */
    expand: ( path: TMosaicPath, percentage?: number ) => void;
    /**
     * Remove the node at `path`
     * @param path
     */
    remove: (path: TMosaicPath) => void;
    /**
     * Hide the node at `path` but keep it in the DOM. Used in Drag and Drop
     * @param path
     */
    hide: (path: TMosaicPath) => void;
    /**
     * Replace currentNode at `path` with `node`
     * replace는 후순위로 생각하고 개발 해야 할듯. 일단 인터페이스는 잡아놈
     * @param path
     * @param node
     */
    replaceWith: () => void;
    /**
     * Returns the root of this Mosaic instance
     */
    getRoot: () => TMosaicNode<T> | null;
}

export interface IMosaicWindowActions {

}