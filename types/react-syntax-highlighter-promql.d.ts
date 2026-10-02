/**
 * `promql` is the one registered language shipped without its own types in
 * `@types/react-syntax-highlighter`. It is used by the Grafana/Prometheus
 * snippets in content/blog, so it is registered like the rest — this just gives
 * that single import a shape.
 */
declare module 'react-syntax-highlighter/dist/esm/languages/prism/promql' {
  const language: {
    name: string
    // The grammars differ in which hooks they define, so only the fields the
    // highlighter actually reads are typed here.
    [key: string]: unknown
  }
  export default language
}
