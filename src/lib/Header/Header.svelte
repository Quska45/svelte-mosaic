<script lang="ts">
    let clientX;
    let clientY;
    document.body.addEventListener('mousemove', ( e:MouseEvent ) => {
        clientX = e.clientX;
        clientY = e.clientY;
    });
</script>

<header class="svelte-mosaic-header">
    svelte-mosaic
    <br/>
    {clientX} / {clientY}
</header>

<style>
    .svelte-mosaic-header {
        color: white;
        background: black;
        height: 50px;
        display: flex;
        padding: 4px;
    }
</style>