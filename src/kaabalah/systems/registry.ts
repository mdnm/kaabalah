import { Bridge, Loader, Unloader } from '../tree-of-life'
import * as hermeticQabalah from './hermetic-qabalah'
import * as kaabalah from './kaabalah'
import * as lurianicKabbalah from './lurianic-kabbalah'

export type System = {
  SYSTEM: string
  LOADERS: Record<string, Loader>
  UNLOADERS: Record<string, Unloader>
  BRIDGES: Bridge[]
}

export const SYSTEMS: System[] = [kaabalah, hermeticQabalah, lurianicKabbalah]

export type SystemKey = typeof SYSTEMS[number]['SYSTEM']
export type PartKey   = keyof typeof kaabalah.LOADERS | keyof typeof hermeticQabalah.LOADERS | keyof typeof lurianicKabbalah.LOADERS