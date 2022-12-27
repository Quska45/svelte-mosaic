<script lang="ts">
    import type { IInset } from '../Common/Inset';
    /**
     * Split의 inset 마지막 값(left)의 값은 모든 split이 같은 값을 공유한다.
     * row의 경우엔 
    */
    import type {
    MosaicNode,
        TMosaicDirection,
        TMosaicNode
    } from '../MosaicNode/MosaicNode'
    import type { Split } from './Split';

    export let direction: TMosaicDirection;
    export let nodeId: string;
    export let parentNodeId: string;
    export let inset: IInset;
    export let mosaicWindows: MosaicNode<number>[];
    export let splits: Split<number>[];
    export let tree: TMosaicNode<number>;
    export let parentTree: TMosaicNode<number>;

    export let event;
    export let split: Split<number>;
</script>

<div 
    class="mosaic-split {direction}" 
    style="inset: { `${split.splitPercentage.inset.top}% ${split.splitPercentage.inset.right}% ${split.splitPercentage.inset.bottom}% ${split.splitPercentage.inset.left}%` };"
    on:mousedown = {( e ) => event.positionChange( e, split )}
>
</div>

<style>
    .mosaic-split {
        position: absolute;
        background-color: blueviolet;
    }
    .mosaic-split.row {
        margin: -2px;
        width: 6px;
        cursor: e-resize;
    }
    .mosaic-split.column {
        margin: -2px;
        height: 6px;
        cursor: ns-resize
    }
</style>