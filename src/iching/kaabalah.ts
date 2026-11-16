import {
  getCanonicalTree,
  id,
  parseId,
  KaabalahTypes,
  LetterTypes,
  TarotTypes,
  NumerologyTypes,
} from "../core";
import { GATE_LETTERS, FAMILY_SPHERES } from "./tables";
import { getHexagram, getPalace, getTrigram } from "./calculations";
import type { TrigramId } from "./types";

/** Only the fixed trigram-to-letter mapping is stored here; all addresses come from the tree. */
export function getTrigramGate(trigramId: TrigramId) {
  const trigram = getTrigram(trigramId);
  const tree = getCanonicalTree({ system: "kaabalah", parts: ["tarot"] });
  const letter = tree.getNode(
    id(LetterTypes.HEBREW_LETTER, GATE_LETTERS[trigram.id]),
  );
  if (!letter) throw new Error(`Missing canonical letter for ${trigram.hanzi}`);
  const paths = tree.getCorrespondences(letter.id, {
    type: KaabalahTypes.PATH,
    depth: 1,
  });
  if (paths.length !== 1)
    throw new Error(`Expected one canonical path for ${letter.id}`);
  const path = paths[0].node;
  const arcanum = tree.getCorrespondences(path.id, {
    type: TarotTypes.TAROT_ARK_ANNU,
    depth: 1,
    limit: 1,
  })[0]?.node;
  if (!path.data || !arcanum)
    throw new Error(`Missing path or arcanum for ${letter.id}`);
  const number = tree.getCorrespondences(arcanum.id, {
    type: NumerologyTypes.NUMBER,
    depth: 1,
    limit: 1,
  })[0]?.node;
  const from = tree.getNode(path.data.from),
    to = tree.getNode(path.data.to);
  if (!number || !from || !to)
    throw new Error(`Incomplete canonical path ${path.id}`);
  return {
    trigram,
    letter: {
      id: letter.id,
      name: parseId(letter.id),
      character: letter.data?.character,
      value: letter.data?.gematriaValue,
    },
    path: {
      id: path.id,
      number: Number(parseId(path.id)),
      from: { id: from.id, name: parseId(from.id) },
      to: { id: to.id, name: parseId(to.id) },
    },
    arcanum: {
      id: arcanum.id,
      number: Number(parseId(number.id)),
      name: parseId(arcanum.id),
    },
  };
}
export function getFamilySphere(trigramId: TrigramId) {
  const trigram = getTrigram(trigramId);
  const tree = getCanonicalTree({ system: "kaabalah", parts: ["tarot"] });
  const sphere = tree.getNode(
    id(KaabalahTypes.SPHERE, FAMILY_SPHERES[trigram.id]),
  );
  if (!sphere)
    throw new Error(`Missing canonical family sphere for ${trigram.hanzi}`);
  return {
    trigram,
    family: trigram.family,
    sphere: { id: sphere.id, name: parseId(sphere.id) },
  };
}
export function getTrigramPillars(trigramId: TrigramId) {
  const trigram = getTrigram(trigramId);
  return {
    left: trigram.lines[2] === 1,
    middle: trigram.lines[1] === 1,
    right: trigram.lines[0] === 1,
  };
}
export const LINE_POSITIONS = Object.freeze(
  [
    {
      position: 1,
      tree: "lower",
      pillar: "right",
      domain: "Foundation, roots, family",
    },
    {
      position: 2,
      tree: "lower",
      pillar: "middle",
      domain: "Inner mental life, close relationships",
    },
    {
      position: 3,
      tree: "lower",
      pillar: "left",
      domain: "Chance encounters, the unknown",
    },
    {
      position: 4,
      tree: "upper",
      pillar: "right",
      domain: "Community, friends",
    },
    {
      position: 5,
      tree: "upper",
      pillar: "middle",
      domain: "Bosses, government, authority",
    },
    {
      position: 6,
      tree: "upper",
      pillar: "left",
      domain: "God, the universe, the way the wind blows",
    },
  ].map((p) => Object.freeze(p)),
);
export function getHexagramKaabalah(number: number) {
  const hexagram = getHexagram(number),
    palace = getPalace(number);
  return {
    gate: {
      upper: getTrigramGate(hexagram.upper.id),
      lower: getTrigramGate(hexagram.lower.id),
      order: "upper-lower" as const,
    },
    rulingArcanum: getTrigramGate(palace.trigram.id),
    family: {
      upper: getFamilySphere(hexagram.upper.id),
      lower: getFamilySphere(hexagram.lower.id),
    },
    pillars: {
      upper: getTrigramPillars(hexagram.upper.id),
      lower: getTrigramPillars(hexagram.lower.id),
    },
  };
}
export function listHexagramGates() {
  return Array.from({ length: 64 }, (_, i) => ({
    hexagram: getHexagram(i + 1),
    gate: getHexagramKaabalah(i + 1).gate,
  }));
}
