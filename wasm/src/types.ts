/**
 * Type definitions for Swiss Ephemeris WebAssembly module
 */

export interface SwissEphModule {
  _malloc(size: number): number;
  _free(ptr: number): void;
  getValue(ptr: number, type: string): number;
  stringToUTF8(str: string, ptr: number, maxLength: number): void;
  cwrap<T>(name: string, returnType: string | null, paramTypes: (string | null)[]): T;
}

export interface SwissEphModuleFactory {
  (options?: { locateFile?: (path: string, scriptDirectory: string) => string }): Promise<SwissEphModule>;
}

// Wrapped function types
export type SweJulDay = (year: number, month: number, day: number, hour: number, flag: number) => number;
export type SweCalcUt = (julday: number, planet: number, flag: number, result: number) => number;
export type SweHouses = (julday: number, lat: number, lon: number, hsys: string, result: number, ascmc: number) => number;
export type SweHousePos = (armc: number, lat: number, eps: number, hsys: string, lon: number, lat2: number) => number;
export type SweSetEphePath = (path: number) => void;
export type SweClose = () => void; 