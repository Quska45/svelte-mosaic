<script lang="ts">
    export let event;
</script>

<div 
    id="drop-target-container"
    on:dragover={ ( e ) => event.dragOver( e ) }
>

</div>

<style>
    #drop-target-container{
        display: none;
        background: rgba(138, 187, 255, 0.2);
        border: 2px solid #4c90f0;
        transition: opacity 100ms;
        border-radius: 2px;
        position: absolute;
    }
    #drop-target-container .top{
        bottom: calc(100% - 10px );
    }
    #drop-target-container .right{
        left: calc(100% - 10px );
    }
    #drop-target-container .bottom{
        top: calc(100% - 10px );
    }
    #drop-target-container .left{
        right: calc(100% - 10px );
    }
</style>