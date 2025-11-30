/**
 * Type definitions for Swiss Ephemeris WebAssembly module
 */

export interface SwissEphModule {
  _malloc(size: number): number;
  _free(ptr: number): void;
  getValue(ptr: number, type: string): number;
  stringToUTF8(str: string, ptr: number, maxLength: number): void;
  cwrap<T>(name: string, returnType: string | null, paramTypes: (string | null)[]): T;
  UTF8ToString(ptr: number): string;
  HEAP8: Int8Array;
  fill(value: number, start: number, end: number): void;
  FS?: {
    mkdir(path: string): void;
    mount(fs: unknown, opts: { root: string }, mountPoint: string): void;
    createPreloadedFile(
      parent: string,
      name: string,
      url: string,
      canRead: boolean,
      canWrite: boolean
    ): void;
    writeFile(path: string, data: Uint8Array | string, opts?: unknown): void;
    filesystems: {
      NODEFS: unknown;
    };
  };
}

export interface SwissEphModuleFactory {
  (options?: { locateFile?: (path: string, scriptDirectory: string) => string }): Promise<SwissEphModule>;
}

// Wrapped function types
export type SweJulDay = (year: number, month: number, day: number, hour: number, flag: number) => number;
export type SweCalcUt = (julday: number, planet: number, flag: number, result: number, err: number) => number;
export type SweHouses = (julday: number, lat: number, lon: number, hsys: number, result: number, ascmc: number) => number;
export type SweHousePos = (armc: number, lat: number, eps: number, hsys: string, lon: number, lat2: number) => number;
export type SweSetEphePath = (path: number) => void;
export type SweClose = () => void; 
export type SweSetTopo = (lon: number, lat: number, altm: number) => void;
export type SweSetSidMode = (mode: number, t0: number, ayan_t0: number) => void;