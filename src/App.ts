import type {
    TMosaicNode
} from './lib/MosaicNode/MosaicNode'
import type {
    TMosaicKey
} from './lib/types/types';
import {
    MosaicNode
} from './lib/MosaicNode/MosaicNode';

export const THEMES = {
    'Blueprint': 'mosaic-blueprint-theme',
    'None': ''
};

export type Theme = keyof typeof THEMES;

export interface IExampleAppState {
    currentNode: TMosaicNode<number> | null;
    currentTheme: Theme;
};

export class ExampleAppState {
    currentNode: TMosaicNode<number> | null;
    currentTheme: Theme;

    constructor( currentNode: TMosaicNode<number>, currentTheme: Theme ) {
        this.currentNode = currentNode;
        this.currentTheme = currentTheme
    }
};
