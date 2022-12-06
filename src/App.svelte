<script>

  import Mosaic from "./lib/Mosaic/Mosaic.svelte";
  let items = [
        {id: 1, name: "item1"},
        {id: 2, name: "item2"},
        {id: 3, name: "item3"},
        {id: 4, name: "item4"}
  ];

</script>

<main>

  <Mosaic items={items}></Mosaic>
  
</main>

<style>
</style>