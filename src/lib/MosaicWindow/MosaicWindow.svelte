<script lang="ts">
    import type { IInset } from "../Common/Inset";
  import type { MosaicNode, TMosaicDirection, TMosaicNode } from "../MosaicNode/MosaicNode";
    import type { Split } from "../Split/Split";
    import type { TMosaicKey } from "../types/types";


  export let nodeId: string;
  export let parentNodeId: string;
  export let direction: TMosaicDirection;
  export let mosaicWindows: MosaicNode<number>[];
  export let splits: Split<number>[];
  export let inset: IInset;
  export let tree: TMosaicNode<number>;
  export let parentTree: TMosaicNode<number>;
  export let isFirst: boolean;

  function callback( event ){
    inset.right += 5;
    event.preventDefault();
    return;
  }

  const Event = {
    split: function( mosaicPieceManagerSplit: Function ){
      console.log( `${nodeId} : window split event dispatch` );
      console.log(tree);
      console.log(parentTree);
      console.log(isFirst);
      mosaicPieceManagerSplit( parentTree, isFirst );
    }
  }
</script>

<div class="mosaic-window" draggable="true" style="inset: { `${inset.top}% ${inset.right}% ${inset.bottom}% ${inset.left}%` };">
  <div class="mosaic-preview">
    <div class="mosaic-window-toolbar">
      <div class="mosaic-window-title"></div>
      <button class="mosaic-title-button mosaic-split" on:click={Event.split}>나누기</button>
      <button class="mosaic-title-button mosaic-delete">삭제</button>
    </div>
    <div class="mosaic-window-body">
      <h4>title</h4>
    </div>
  </div>
</div>

<style>
  .mosaic-window {
    border: 1px solid red;
    margin: 3px;
    position: absolute;
  }
  .mosaic-window-toolbar {
    border-bottom: 1px solid red;
    display: flex;
    justify-content: flex-end;
    cursor: move;
  }
</style>