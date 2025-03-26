import type { SwissEphModuleFactory } from './types';

declare module '*.js' {
  const moduleFactory: SwissEphModuleFactory;
  export default moduleFactory;
} 