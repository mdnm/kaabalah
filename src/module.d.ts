declare const WASM_PATH: string;
declare const EPHE_PATH: string;

declare module '*.wasm?url' {
  const path: string;
  export default path;
} 