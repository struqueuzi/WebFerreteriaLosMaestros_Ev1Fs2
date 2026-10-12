// Babel solo lo usa Karma (vía babel-loader). Vite compila el proyecto con su propio plugin de React.
module.exports = (api) => {
  const enPruebas = api.env("test");
  return {
    presets: [
      ["@babel/preset-env", { targets: { chrome: "100" } }],
      ["@babel/preset-react", { runtime: "automatic" }]
    ],
    // En pruebas se "instrumenta" el código para medir la cobertura (karma-coverage)
    plugins: enPruebas
      ? [["istanbul", { exclude: ["**/*.spec.js", "**/*.spec.jsx", "src/testing/**", "src/tests.index.js"] }]]
      : []
  };
};
