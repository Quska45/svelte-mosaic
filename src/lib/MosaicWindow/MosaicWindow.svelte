<script lang="ts">
    import type { IInset } from "../Common/Inset";
    import type { MosaicNode, TMosaicDirection, TMosaicNode } from "../MosaicNode/MosaicNode";
    import type { MosaicPieceManager } from "../MosaicNode/MosaicPieceManager";
    import type { Split } from "../Split/Split";
    import type { TMosaicKey } from "../types/types";


  export let nodeId: string;
  export let parentNodeId: string;
  export let direction: TMosaicDirection;
  export let inset: IInset;
  export let tree: TMosaicNode<number>;
  export let parentTree: TMosaicNode<number>;
  export let isFirst: boolean;
  export let mosaicWindow: MosaicNode<number>;

  export let mosaicPieceManager: MosaicPieceManager<number>;
  export let event;

  export let testCallback;

  function callback( event ){
    inset.right += 5;
    event.preventDefault();
    return;
  }
</script>

<div class="mosaic-window" draggable="true" style="inset: { `${mosaicWindow.splitPercentage.inset.top}% ${mosaicWindow.splitPercentage.inset.right}% ${mosaicWindow.splitPercentage.inset.bottom}% ${inset.left}%` };">
  <div class="mosaic-preview">
    <div class="mosaic-window-toolbar">
      <div class="mosaic-window-title"></div>
      <button class="mosaic-title-button mosaic-split" on:click={()=>event.split( tree, parentTree, isFirst, mosaicWindow )}>나누기</button>
      <button class="mosaic-title-button mosaic-delete" on:click={testCallback}>삭제</button>
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