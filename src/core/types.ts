import { ColorData, HebrewLetterData, MusicalNoteData, PathData, TarotArkAnnuData, WesternZodiacSignData, WorldData } from "./constants";

import { SphereData } from "./constants";

export enum KaabalahTypes {
  SPHERE = 'sphere',
  PATH = 'path',
  WORLD = 'world',
}

export enum LetterTypes {
  HEBREW_LETTER = 'hebrewLetter',
  LATIN_LETTER = 'latinLetter',
  SANSKRIT_LETTER = 'sanskritLetter',
  ARCHEOMETER_LETTER = 'archeometerLetter',
}

export enum WesternAstrologyTypes {
  PLANET = 'planet',
  WESTERN_ZODIAC_SIGN = 'westernZodiacSign',
  WESTERN_ELEMENT = 'westernElement',
}

export enum TarotTypes {
  TAROT_ARK_ANNU = 'tarotArkAnnu',
  TAROT_SUIT = 'tarotSuit',
}

export enum TantraTypes {
  CHAKRA = 'chakra',
  SUBTLE_BODY = 'subtleBody',
}

export enum NumerologyTypes {
  NUMBER = 'number',
}

export enum MiscTypes {
  COLOR = 'color',
  MUSICAL_NOTE = 'musicalNote',
  UNCATEGORIZED = 'uncategorized',
}

export type NodeType =
  | typeof KaabalahTypes[keyof typeof KaabalahTypes]
  | typeof LetterTypes[keyof typeof LetterTypes]
  | typeof NumerologyTypes[keyof typeof NumerologyTypes]
  | typeof MiscTypes[keyof typeof MiscTypes]
  | typeof TarotTypes[keyof typeof TarotTypes]
  | typeof TantraTypes[keyof typeof TantraTypes]
  | typeof WesternAstrologyTypes[keyof typeof WesternAstrologyTypes];

type Branded<T, B> = T & { readonly __brand: B }
export type NodeId<T extends NodeType> = Branded<`${T}:${string}`, T>

export const id = <T extends NodeType>(
  type: T,
  value: string | number,
): NodeId<T> => `${type}:${value}` as NodeId<T>;

export const parseId = <T extends NodeType>(nodeId: NodeId<T>) => {
  const parsedId = nodeId.split(':');

  if (parsedId.length !== 2) {
    throw new Error(`Invalid node id: ${nodeId}`);
  }

  return parsedId[1];
}

interface DataMap {
  sphere: SphereData
  path: PathData
  world: WorldData
  hebrewLetter: HebrewLetterData
  color: ColorData
  musicalNote: MusicalNoteData
  westernZodiacSign: WesternZodiacSignData
  tarotArkAnnu: TarotArkAnnuData
}

export type NodeData<T extends NodeType> = T extends keyof DataMap
  ? DataMap[T]
  : never

export interface Node<T extends NodeType> {
  id: NodeId<T>
  type: T
  data?: NodeData<T>
  name?: string;
}

export class BaseNode<T extends NodeType> implements Node<T> {
  id: NodeId<T>
  type: T
  data?: NodeData<T>
  _name?: string;

  constructor({ id: idValue, type, data, name }: Omit<Node<T>, "id"> & { id: string | number }) {
    this.id = id(type, idValue) as NodeId<T>
    this.type = type
    this.data = data
    this._name = name
  }

  get name(): string {
    return this._name ?? parseId(this.id)
  }
}
