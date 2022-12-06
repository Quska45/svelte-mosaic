svelte({
    preprocess: sveltePreprocess({
      sourceMap: !production,
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    }),
})