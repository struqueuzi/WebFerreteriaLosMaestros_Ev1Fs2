// Punto de entrada de Karma: importa todos los módulos del proyecto (para que la cobertura
// incluya también los archivos sin pruebas) y todas las pruebas *.spec.
// (import.meta.webpackContext es la versión para módulos ES de require.context)
const contexto = import.meta.webpackContext("./", {
  recursive: true,
  regExp: /^\.\/(components|context|hooks|lib|pages)\/.*\.jsx?$/
});
contexto.keys().forEach(contexto);
