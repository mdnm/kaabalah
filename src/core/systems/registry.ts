import { TreeOfLife } from "../tree-of-life";
import * as hermeticQabalah from "./hermetic-qabalah";
import * as kaabalah from "./kaabalah";
import * as lurianicKabbalah from "./lurianic-kabbalah";

export type System = {
  SYSTEM: "kaabalah" | "hermetic-qabalah" | "lurianic-kabbalah";
  LOADERS: Record<string, Loader>;
  UNLOADERS: Record<string, Unloader>;
  BRIDGES: Bridge[];
};

export const SYSTEMS: System[] = [kaabalah, hermeticQabalah, lurianicKabbalah];

export type SystemKey = (typeof SYSTEMS)[number]["SYSTEM"];
export type PartKey =
  | keyof typeof kaabalah.LOADERS
  | keyof typeof hermeticQabalah.LOADERS
  | keyof typeof lurianicKabbalah.LOADERS;

export type Loader = (t: TreeOfLife) => TreeOfLife;
export type Unloader = (t: TreeOfLife) => void;
export type Bridge = {
  id: string;
  needs: PartKey[];
  run: (t: TreeOfLife) => void;
};
