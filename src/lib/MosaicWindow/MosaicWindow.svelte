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

</script>

<div 
  class="mosaic-window" 
  style="
    inset: { `${mosaicWindow.splitPercentage.inset.top}% ${mosaicWindow.splitPercentage.inset.right}% ${mosaicWindow.splitPercentage.inset.bottom}% ${inset.left}%` };
    display: { `${mosaicWindow.isDisplay}` }
  "
  on:dragover={( e ) => event.dragOver( e )}
  on:dragend={( e ) => event.dragEnd( e )}
  on:dragenter={( e ) => event.dragEnter( e )}
  on:drop={( e ) => event.drop( e )}
  data-node-id = { mosaicWindow.id }
  data-parent-node-id = { mosaicWindow.parentNodeId }
  data-is-first = { mosaicWindow.isFirst }
  >
  <div class="mosaic-preview">
    <div 
      class="mosaic-window-toolbar" 
      draggable="true"
      on:dragstart={( e ) => event.dragStart( e, mosaicWindow )}
      >
      <div class="mosaic-window-title">
        {JSON.parse(JSON.stringify(parentTree)).title} / {isFirst}
      </div>
      <div>
        <button class="mosaic-title-button mosaic-split" on:click={()=>event.split( parentTree, isFirst )}>나누기</button>
        <button class="mosaic-title-button mosaic-delete" on:click={()=>event.delete( nodeId, isFirst )}>삭제</button>
      </div>
    </div>
    <div class="mosaic-window-body">
      <h4>{JSON.parse(JSON.stringify(parentTree)).parentNodeId} / {JSON.parse(JSON.stringify(parentTree)).id}</h4>
    </div>
  </div>
</div>

<style>
  .mosaic-window {
    background: #fefefe;
    border: 1px solid #636363;
    margin: 3px;
    border-radius: 4px;
    position: absolute;
    text-align: center;
  }
  .mosaic-window-toolbar {
    cursor: move;
    display: flex;
    white-space: nowrap;
    border-bottom: 1px solid #636363;
    justify-content: space-between;
    background: #fefefe;
    padding: 4px 8px;
    max-height: 20px;
    align-items: center;
  }
  .mosaic-title-button {
    width: 50%;
    height: 5%;
  }
</style>