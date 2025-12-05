declare const WASM_PATH: string;
declare const EPHE_PATH: string;

declare module '*.wasm?url' {
  const path: string;
  export default path;
} 

declare module 'geo-tz' {
  export function find(lat: number, lon: number): string[];
  const _default: ((lat: number, lon: number) => string | string[]);
  export default _default;
}