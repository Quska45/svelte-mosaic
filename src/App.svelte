<script>

  import Mosaic from "./lib/Mosaic/Mosaic.svelte";
  import Header from "./lib/Header/Header.svelte";

</script>

<main class="svelte-mosaic-example-app">

  <Header></Header>
  <Mosaic></Mosaic>
  
</main>

<style>
  html, body, #app, .svelte-mosaic-example-app {
    width: 100%;
    height: 100%;
    margin: 0;
  }
</style>