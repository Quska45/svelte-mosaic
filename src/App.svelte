<script lang="ts">

  import Mosaic from "./lib/Mosaic/Mosaic.svelte";
  import Header from "./lib/Header/Header.svelte";
  import type {
    IExampleAppState
  } from './App';
  import type { IInset } from "./lib/Common/Inset";


  let exampleAppState: IExampleAppState = {
    currentNode: {
      id: 'master1',
      title: 'window1',
      parentNodeId: '',
      direction: 'row',
      first: 1,
      second: {
        id: 'master2',
        title: 'window2',
        parentNodeId: 'master1',
        direction: 'column',
        first: 2,
        second: 3,
        splitPercentage: {
          percentage: 50,
        }
      },
      splitPercentage: {
        percentage: 40
      },
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