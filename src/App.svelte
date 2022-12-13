<script lang="ts">

  import Mosaic from "./lib/Mosaic/Mosaic.svelte";
  import Header from "./lib/Header/Header.svelte";
  import type {
    IExampleAppState
  } from './App';

  let exampleAppState: IExampleAppState = {
    currentNode: {
      direction: 'row',
      first: 1,
      second: {
        direction: 'column',
        first: 2,
        second: 3,
      },
      splitPercentage: 40,
    },
    currentTheme: 'Blueprint',
  };

</script>

<main class="svelte-mosaic-example-app">
  <Header></Header>
  <Mosaic
    exampleAppState = { exampleAppState }
  ></Mosaic>
</main>

<style global>
  html, body, #app, .svelte-mosaic-example-app {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
  }
</style>