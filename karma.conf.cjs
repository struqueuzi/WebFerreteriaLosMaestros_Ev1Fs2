// Karma + Jasmine: ejecuta las pruebas unitarias en un Chrome real (sin ventana) y mide la cobertura.
// Los archivos del proyecto se empaquetan con webpack + Babel (para entender JSX).
process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "webpack"],
    plugins: [
      require("karma-jasmine"),
      require("karma-webpack"),
      require("karma-chrome-launcher"),
      require("karma-coverage"),
      require("karma-jasmine-html-reporter")
    ],

    // Un único punto de entrada: carga TODOS los módulos del proyecto y todas las pruebas (*.spec.js / *.spec.jsx)
    files: [{ pattern: "src/tests.index.js", watched: false }],
    preprocessors: { "src/tests.index.js": ["webpack"] },

    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      module: {
        rules: [
          { test: /\.jsx?$/, exclude: /node_modules/, use: "babel-loader" },
          // El proyecto es "type": "module": permite importar sin escribir la extensión (./almacen)
          { test: /\.jsx?$/, resolve: { fullySpecified: false } }
        ]
      },
      resolve: { extensions: [".js", ".jsx"] }
    },
    webpackMiddleware: { stats: "errors-only" },

    client: { jasmine: { random: false } }, // mismo orden siempre: resultados reproducibles
    reporters: ["progress", "kjhtml", "coverage"],
    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "html" },        // informe navegable: coverage/html/index.html
        { type: "text-summary" },                // resumen en la consola
        { type: "lcovonly", subdir: "lcov" }
      ]
    },

    browsers: ["ChromeHeadlessSinSandbox"],
    customLaunchers: {
      ChromeHeadlessSinSandbox: { base: "ChromeHeadless", flags: ["--no-sandbox"] }
    },
    singleRun: true,
    restartOnFileChange: true
  });
};
