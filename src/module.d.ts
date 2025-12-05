declare const WASM_PATH: string;
declare const EPHE_PATH: string;

declare module '*.wasm?url' {
  const path: string;
  export default path;
} 

declare module 'tz-lookup' {
  const tzLookup: (lat: number, lon: number) => string;
  export default tzLookup;
}