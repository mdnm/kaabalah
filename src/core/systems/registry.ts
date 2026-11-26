import { TreeOfLife } from "../tree-of-life";
import * as kaabalah from "./kaabalah";

export type System = {
  SYSTEM: "kaabalah";
  LOADERS: Record<string, Loader>;
  UNLOADERS: Record<string, Unloader>;
  BRIDGES: Bridge[];
};

/** The Tree systems. Kaabalah, as taught by the Melkitzedeki Order, is the only one. */
export const SYSTEMS: System[] = [kaabalah];

export type SystemKey = (typeof SYSTEMS)[number]["SYSTEM"];
export type PartKey = keyof typeof kaabalah.LOADERS;

export type Loader = (t: TreeOfLife) => TreeOfLife;
export type Unloader = (t: TreeOfLife) => void;
export type Bridge = {
  id: string;
  needs: PartKey[];
  run: (t: TreeOfLife) => void;
};
