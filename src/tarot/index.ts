/**
 * Tarot interpretation functions
 */

import {
  getCanonicalTree,
  id,
  KaabalahTypes,
  LetterTypes,
  NumerologyTypes,
  parseId,
  TarotTypes,
  type NodeId,
  type Node,
  WesternAstrologyTypes
} from "../core";
import {
  DEFAULT_TAROT_TREE_ID,
  majorArcana,
  TAROT_DECK_METADATA,
  TAROT_TREE_IDS,
  type MajorArcana,
  type TarotCard,
  type TarotDeckConfig,
  type TarotDeckDescription,
  type TarotDeckId,
  type TarotDeckMetadata,
  type TarotTreeId,
} from "./data";
import { ARKANNUS, getDirectTarotCardNumber, getTarotTreeWorkspace } from "./arkannus";

export { ARKANNUS } from "./arkannus";
export {
  DEFAULT_TAROT_TREE_ID,
  TAROT_TREE_IDS,
  majorArcana,
  type Deck,
  type MajorArcana,
  type TarotCard,
  type TarotDeckDescription,
  type TarotDeckId,
  type TarotDeckMetadata,
  type TarotTreeId,
} from "./data";
export * from "./spreads";


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const shuffleArray = <T,>(array: T[], rng: () => number = Math.random): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));

    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray
}

/**
 * Shuffles a deck of tarot cards and optionally includes inverted cards
 * @param cards - Array of tarot cards to shuffle
 * @param includeInvertedCards - Whether to include inverted cards in the shuffle
 * @param shuffleCount - Number of times to shuffle the deck (default: 6)
 * @param shuffleDelay - Delay between shuffles in milliseconds (default: 300)
 * @param rng - Optional randomness source for tests/replay (default: Math.random)
 * @returns Promise that resolves to the shuffled deck
 */
export async function shuffleTarotDeck(
  cards: TarotCard[],
  includeInvertedCards: boolean = false,
  shuffleCount: number = 6,
  shuffleDelay: number = 300,
  rng: () => number = Math.random
): Promise<TarotCard[]> {
  let shuffledCards = shuffleArray([...cards], rng);

  if (includeInvertedCards) {
    const halfIndex = Math.floor(shuffledCards.length / 2);
    shuffledCards = [
      ...shuffledCards
        .slice(0, halfIndex)
        .map(card => ({ ...card, isInverted: true })),
      ...shuffledCards.slice(halfIndex)
    ];
  }

  for (let i = 0; i < shuffleCount; i++) {
    shuffledCards = shuffleArray(shuffledCards, rng);
    await sleep(shuffleDelay);
  }

  return shuffledCards;
}

export type TarotAstrologyCorrespondenceType =
  | WesternAstrologyTypes.PLANET
  | WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
  | WesternAstrologyTypes.WESTERN_ELEMENT;

export interface TarotAstrologyCorrespondence {
  type: TarotAstrologyCorrespondenceType;
  id: NodeId<TarotAstrologyCorrespondenceType>;
  label: string;
}

export interface TarotArchetype {
  canonicalId: NodeId<KaabalahTypes.PATH>;
  kind: "major";
  pathId: NodeId<KaabalahTypes.PATH>;
  pathNumber: number;
  pathSlug: string;
  hebrewLetterId: NodeId<LetterTypes.HEBREW_LETTER>;
  hebrewLetter: string;
  pathMeaning?: string;
  tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU>;
  tarotCardNumber: number;
  tarotCardName: string;
  tarotCardFilename: MajorArcana;
  tarotMeaning?: string;
  astrology: TarotAstrologyCorrespondence[];
  availableDeckIds: TarotDeckId[];
  descriptionsByDeck: Partial<Record<TarotDeckId, TarotDeckDescription>>;
}

export type TarotArchetypeLookup =
  | { pathSlug: string }
  | { pathId: NodeId<KaabalahTypes.PATH> }
  | { tarotCardFilename: MajorArcana | string }
  | { tarotCardNumber: number };

export type TarotCardKind = "major" | "court" | "minor";
export type TarotCourtRank = "king" | "queen" | "knight" | "page";

export type TarotAssetPathType = "major" | "minor" | "daat+royalship";

export interface TarotCardProfile {
  tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU>;
  tarotCardNumber: number;
  tarotCardName: string;
  tarotCardFilename: string;
  tarotMeaning?: string;
  kind: TarotCardKind;
  assetPathType: TarotAssetPathType;
  suit?: string;
  courtRank?: TarotCourtRank;
  availableDeckIds: TarotDeckId[];
  descriptionsByDeck: Partial<Record<TarotDeckId, TarotDeckDescription>>;
}

export type TarotImageLookup =
  | TarotArchetypeLookup
  | { tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU> }
  | { tarotCardName: string };

export type TarotCorrespondenceNodeType =
  | KaabalahTypes.SPHERE
  | LetterTypes.HEBREW_LETTER
  | WesternAstrologyTypes.PLANET
  | WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
  | WesternAstrologyTypes.WESTERN_ELEMENT;

export interface TarotCorrespondenceNode<T extends TarotCorrespondenceNodeType> {
  id: NodeId<T>;
  label: string;
}

export interface TarotPathCorrespondence {
  pathId: NodeId<KaabalahTypes.PATH>;
  pathNumber: number;
  pathSlug: string;
  meaning?: string;
  hebrewLetter: TarotCorrespondenceNode<LetterTypes.HEBREW_LETTER>;
  fromSphere: TarotCorrespondenceNode<KaabalahTypes.SPHERE>;
  toSphere: TarotCorrespondenceNode<KaabalahTypes.SPHERE>;
}

export interface TarotCorrespondenceProfileBase {
  tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU>;
  tarotCardNumber: number;
  tarotCardName: string;
  tarotCardFilename: string;
  tarotMeaning?: string;
  suit?: string;
}

export interface TarotMajorCorrespondenceProfile
  extends TarotCorrespondenceProfileBase {
  kind: "major";
  correspondences: {
    astrology: TarotAstrologyCorrespondence[];
    path: TarotPathCorrespondence;
  };
}

export interface TarotPageCorrespondenceProfile
  extends TarotCorrespondenceProfileBase {
  kind: "court";
  courtRank: "page";
  correspondences: {
    element: TarotCorrespondenceNode<WesternAstrologyTypes.WESTERN_ELEMENT>;
  };
}

export interface TarotCourtAstrologyCorrespondenceProfile
  extends TarotCorrespondenceProfileBase {
  kind: "court";
  courtRank: Exclude<TarotCourtRank, "page">;
  correspondences: {
    sign: TarotCorrespondenceNode<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>;
    planets: TarotCorrespondenceNode<WesternAstrologyTypes.PLANET>[];
  };
}

export interface TarotMinorCorrespondenceProfile
  extends TarotCorrespondenceProfileBase {
  kind: "minor";
  correspondences: {
    sphere: TarotCorrespondenceNode<KaabalahTypes.SPHERE>;
    planets: TarotCorrespondenceNode<WesternAstrologyTypes.PLANET>[];
  };
}

export type TarotCorrespondenceProfile =
  | TarotMajorCorrespondenceProfile
  | TarotPageCorrespondenceProfile
  | TarotCourtAstrologyCorrespondenceProfile
  | TarotMinorCorrespondenceProfile;

export interface TarotRepresentation {
  card: TarotCardProfile;
  archetype?: TarotArchetype;
  deck: TarotDeckMetadata;
  assetPath: string;
  imageUrl: string;
  label: string;
  altText: string;
  cardLabel: string;
  description?: TarotDeckDescription;
}

export const TAROT_IMAGE_BASE_URL =
  "https://kaabalah-app.s3.us-east-1.amazonaws.com/tarot";

type TarotMajorCard = TarotCard & {
  type: "major";
  tarotCardFilename: MajorArcana;
};

type TarotArchetypeCache = {
  archetypes: TarotArchetype[];
  byPathId: Map<string, TarotArchetype>;
  byPathSlug: Map<string, TarotArchetype>;
  byTarotCardFilename: Map<string, TarotArchetype>;
  byTarotCardNumber: Map<number, TarotArchetype>;
};

type TarotCardProfileCache = {
  profiles: TarotCardProfile[];
  byTarotArkAnnuId: Map<string, TarotCardProfile>;
  byTarotCardName: Map<string, TarotCardProfile>;
  byTarotCardFilename: Map<string, TarotCardProfile>;
  byTarotCardNumber: Map<number, TarotCardProfile>;
};

let tarotArchetypeCache: TarotArchetypeCache | undefined;
let tarotCardProfileCache: TarotCardProfileCache | undefined;

function normalizePathSlug(pathSlug: string): string {
  return pathSlug
    .trim()
    .replace(/^\/?path\//i, "")
    .toLowerCase();
}

function normalizeTarotLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

const TAROT_ARK_ANNU_ID_BY_NAME = new Map(
  ARKANNUS.map((card) => [
    normalizeTarotLookupKey(card.tarotCard),
    id(TarotTypes.TAROT_ARK_ANNU, card.tarotCard)
  ] as const)
);

const TAROT_ARK_ANNU_ID_BY_FILENAME = new Map(
  ARKANNUS.map((card) => [
    normalizeTarotLookupKey(card.tarotCardFilename),
    id(TarotTypes.TAROT_ARK_ANNU, card.tarotCard)
  ] as const)
);

const TAROT_COURT_RANKS = [
  "king",
  "queen",
  "knight",
  "page"
] as const satisfies readonly TarotCourtRank[];

const MAJOR_ARCANA_CARDS = ARKANNUS.filter(
  (card): card is TarotMajorCard =>
    card.type === "major" &&
    majorArcana.includes(card.tarotCardFilename as MajorArcana)
);

function toTarotCardKind(card: TarotCard): TarotCardKind {
  if (card.type === "major") {
    return "major";
  }

  return card.type === "minor" ? "minor" : "court";
}

function toTarotCourtRank(card: TarotCard): TarotCourtRank | undefined {
  if (card.type !== "daat+royalship") {
    return undefined;
  }

  const [rank] = card.tarotCardFilename.split("_");
  return TAROT_COURT_RANKS.includes(rank as TarotCourtRank)
    ? (rank as TarotCourtRank)
    : undefined;
}

function toTarotAssetPathType(card: TarotCard): TarotAssetPathType {
  return card.type;
}

function buildTarotAssetPath(card: TarotCardProfile): string {
  if (card.assetPathType === "major") {
    return `major/${card.tarotCardFilename}`;
  }

  if (!card.suit) {
    throw new Error(
      `Missing suit metadata required to resolve tarot image path for ${card.tarotCardName}.`
    );
  }

  return `${card.assetPathType}/${card.suit}/${card.tarotCardFilename}`;
}

function toAstrologyCorrespondence<T extends TarotAstrologyCorrespondenceType>(
  node: Node<T>
): TarotAstrologyCorrespondence {
  return {
    type: node.type,
    id: node.id,
    label: parseId(node.id)
  };
}

function getTarotCorrespondenceTree(
  treeId: TarotTreeId = DEFAULT_TAROT_TREE_ID
) {
  return getCanonicalTree({
    system: treeId,
    parts: ["westernAstrology", "tarot"]
  });
}

type TarotCorrespondenceResolvedNodeType =
  | TarotCorrespondenceNodeType
  | KaabalahTypes.PATH
  | NumerologyTypes.NUMBER
  | TarotTypes.TAROT_SUIT;

type TarotCorrespondenceSourceId = NodeId<
  | TarotTypes.TAROT_ARK_ANNU
  | KaabalahTypes.PATH
  | KaabalahTypes.SPHERE
  | TarotTypes.TAROT_SUIT
  | WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
>;

function getCorrespondenceNodes<T extends TarotCorrespondenceResolvedNodeType>(
  tree: ReturnType<typeof getCanonicalTree>,
  sourceId: TarotCorrespondenceSourceId,
  type: T | readonly T[],
  depth: number = 1,
  limit?: number
): Node<T>[] {
  return tree.getCorrespondences(sourceId, {
    type,
    depth,
    limit
  }).map(({ node }) => node as Node<T>);
}

function getFirstCorrespondenceNode<
  T extends TarotCorrespondenceResolvedNodeType
>(
  tree: ReturnType<typeof getCanonicalTree>,
  sourceId: TarotCorrespondenceSourceId,
  type: T,
  depth: number = 1
): Node<T> | undefined {
  return getCorrespondenceNodes(tree, sourceId, type, depth, 1)[0];
}

function toCorrespondenceNode<T extends TarotCorrespondenceNodeType>(
  node: Node<T> | undefined
): TarotCorrespondenceNode<T> | undefined {
  if (!node) {
    return undefined;
  }

  return {
    id: node.id,
    label: parseId(node.id)
  };
}

function toUniqueCorrespondenceNodes<T extends TarotCorrespondenceNodeType>(
  nodes: Node<T>[]
): TarotCorrespondenceNode<T>[] {
  const seen = new Set<string>();

  return nodes.flatMap((node) => {
    const key = String(node.id);

    if (seen.has(key)) {
      return [];
    }

    seen.add(key);
    return [toCorrespondenceNode(node)!];
  });
}

function toTarotCorrespondenceProfileBase(
  card: TarotCardProfile
): TarotCorrespondenceProfileBase {
  return {
    tarotArkAnnuId: card.tarotArkAnnuId,
    tarotCardNumber: card.tarotCardNumber,
    tarotCardName: card.tarotCardName,
    tarotCardFilename: card.tarotCardFilename,
    tarotMeaning: card.tarotMeaning,
    suit: card.suit
  };
}

function resolveTarotCardProfileForTree(
  lookup: TarotImageLookup,
  treeId: TarotTreeId = DEFAULT_TAROT_TREE_ID
): TarotCardProfile | undefined {
  if ("tarotCardNumber" in lookup) {
    return getTarotCardByNumber(lookup.tarotCardNumber, treeId);
  }

  return getTarotCardProfile(lookup);
}

function buildMajorCorrespondenceProfile(
  card: TarotCardProfile,
  tree: ReturnType<typeof getCanonicalTree>
): TarotMajorCorrespondenceProfile | undefined {
  const pathNode = getFirstCorrespondenceNode(
    tree,
    card.tarotArkAnnuId,
    KaabalahTypes.PATH
  );
  const hebrewLetterNode = pathNode
    ? getFirstCorrespondenceNode(
        tree,
        pathNode.id,
        LetterTypes.HEBREW_LETTER
      )
    : undefined;
  const pathNumberNode = pathNode
    ? getFirstCorrespondenceNode(tree, pathNode.id, NumerologyTypes.NUMBER)
    : undefined;
  const pathNumber = pathNumberNode
    ? Number.parseInt(parseId(pathNumberNode.id), 10)
    : Number.NaN;
  const fromSphereNode = pathNode?.data?.from
    ? tree.getNode(pathNode.data.from)
    : undefined;
  const toSphereNode = pathNode?.data?.to
    ? tree.getNode(pathNode.data.to)
    : undefined;

  if (
    !pathNode ||
    !hebrewLetterNode ||
    !fromSphereNode ||
    !toSphereNode ||
    !Number.isFinite(pathNumber)
  ) {
    return undefined;
  }

  return {
    ...toTarotCorrespondenceProfileBase(card),
    kind: "major",
    correspondences: {
      astrology: getCorrespondenceNodes(
        tree,
        pathNode.id,
        [
          WesternAstrologyTypes.WESTERN_ELEMENT,
          WesternAstrologyTypes.PLANET,
          WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
        ]
      ).map((node) =>
        toAstrologyCorrespondence(
          node as Node<TarotAstrologyCorrespondenceType>
        )
      ),
      path: {
        pathId: pathNode.id,
        pathNumber,
        pathSlug: parseId(hebrewLetterNode.id).toLowerCase(),
        meaning: pathNode.data?.meaning,
        hebrewLetter: toCorrespondenceNode(hebrewLetterNode)!,
        fromSphere: toCorrespondenceNode(
          fromSphereNode as Node<KaabalahTypes.SPHERE>
        )!,
        toSphere: toCorrespondenceNode(
          toSphereNode as Node<KaabalahTypes.SPHERE>
        )!
      }
    }
  };
}

function buildCourtCorrespondenceProfile(
  card: TarotCardProfile,
  tree: ReturnType<typeof getCanonicalTree>
):
  | TarotPageCorrespondenceProfile
  | TarotCourtAstrologyCorrespondenceProfile
  | undefined {
  const suitNode = getFirstCorrespondenceNode(
    tree,
    card.tarotArkAnnuId,
    TarotTypes.TAROT_SUIT
  );

  if (!card.courtRank) {
    return undefined;
  }

  if (card.courtRank === "page") {
    const elementNode = suitNode
      ? getFirstCorrespondenceNode(
          tree,
          suitNode.id,
          WesternAstrologyTypes.WESTERN_ELEMENT
        )
      : undefined;

    if (!elementNode) {
      return undefined;
    }

    return {
      ...toTarotCorrespondenceProfileBase(card),
      kind: "court",
      courtRank: "page",
      correspondences: {
        element: toCorrespondenceNode(elementNode)!
      }
    };
  }

  const signNode = getFirstCorrespondenceNode(
    tree,
    card.tarotArkAnnuId,
    WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
  );

  if (!signNode) {
    return undefined;
  }

  return {
    ...toTarotCorrespondenceProfileBase(card),
    kind: "court",
    courtRank: card.courtRank,
    correspondences: {
      sign: toCorrespondenceNode(signNode)!,
      planets: toUniqueCorrespondenceNodes(
        getCorrespondenceNodes(
          tree,
          signNode.id,
          WesternAstrologyTypes.PLANET
        )
      )
    }
  };
}

function buildMinorCorrespondenceProfile(
  card: TarotCardProfile,
  tree: ReturnType<typeof getCanonicalTree>
): TarotMinorCorrespondenceProfile | undefined {
  const sphereNode = getFirstCorrespondenceNode(
    tree,
    card.tarotArkAnnuId,
    KaabalahTypes.SPHERE
  );

  if (!sphereNode) {
    return undefined;
  }

  return {
    ...toTarotCorrespondenceProfileBase(card),
    kind: "minor",
    correspondences: {
      sphere: toCorrespondenceNode(sphereNode)!,
      planets: toUniqueCorrespondenceNodes(
        getCorrespondenceNodes(tree, sphereNode.id, WesternAstrologyTypes.PLANET)
      )
    }
  };
}

function buildDescriptionsByDeck(
  tarotArkAnnu: Node<TarotTypes.TAROT_ARK_ANNU>
): Partial<Record<TarotDeckId, TarotDeckDescription>> {
  const descriptions: Partial<Record<TarotDeckId, TarotDeckDescription>> = {};

  for (const deck of TAROT_DECK_METADATA) {
    if (!deck.descriptiveDataKey) {
      continue;
    }

    const description =
      tarotArkAnnu.data?.descriptiveData?.[deck.descriptiveDataKey];

    if (!description) {
      continue;
    }

    descriptions[deck.id] = { ...description };
  }

  return descriptions;
}

function getTarotArchetypeCache(): TarotArchetypeCache {
  if (tarotArchetypeCache) {
    return tarotArchetypeCache;
  }

  const tree = getCanonicalTree({
    system: "kaabalah",
    parts: ["westernAstrology", "tarot"]
  });

  const archetypes = MAJOR_ARCANA_CARDS.map((card) => {
    const pathId = id(KaabalahTypes.PATH, card.number);
    const path = tree.getNode(pathId);
    const hebrewLetter = tree.getCorrespondences(pathId, {
      type: LetterTypes.HEBREW_LETTER,
      limit: 1
    })[0]?.node;
    const tarotArkAnnu = tree.getCorrespondences(pathId, {
      type: TarotTypes.TAROT_ARK_ANNU,
      limit: 1
    })[0]?.node;

    if (!path || !hebrewLetter || !tarotArkAnnu) {
      throw new Error(
        `Missing canonical tarot archetype metadata for ${pathId}.`
      );
    }

    const astrology = tree.getCorrespondences(pathId, {
      type: [
        WesternAstrologyTypes.WESTERN_ELEMENT,
        WesternAstrologyTypes.PLANET,
        WesternAstrologyTypes.WESTERN_ZODIAC_SIGN
      ]
    }).map(({ node }) =>
      toAstrologyCorrespondence(
        node as Node<TarotAstrologyCorrespondenceType>
      )
    );

    const descriptionsByDeck = buildDescriptionsByDeck(tarotArkAnnu);

    return {
      canonicalId: pathId,
      kind: "major" as const,
      pathId,
      pathNumber: card.number,
      pathSlug: parseId(hebrewLetter.id).toLowerCase(),
      hebrewLetterId: hebrewLetter.id,
      hebrewLetter: parseId(hebrewLetter.id),
      pathMeaning: path.data?.meaning,
      tarotArkAnnuId: tarotArkAnnu.id,
      tarotCardNumber: card.number,
      tarotCardName: parseId(tarotArkAnnu.id),
      tarotCardFilename: card.tarotCardFilename,
      tarotMeaning:
        descriptionsByDeck.papus_pt?.meaning ??
        card.meaning,
      astrology,
      availableDeckIds: TAROT_DECK_METADATA.map((deck) => deck.id),
      descriptionsByDeck
    };
  });

  tarotArchetypeCache = {
    archetypes,
    byPathId: new Map(archetypes.map((archetype) => [archetype.pathId, archetype])),
    byPathSlug: new Map(
      archetypes.map((archetype) => [archetype.pathSlug, archetype])
    ),
    byTarotCardFilename: new Map(
      archetypes.map((archetype) => [archetype.tarotCardFilename, archetype])
    ),
    byTarotCardNumber: new Map(
      archetypes.map((archetype) => [archetype.tarotCardNumber, archetype])
    )
  };

  return tarotArchetypeCache;
}

function getTarotCardProfileCache(): TarotCardProfileCache {
  if (tarotCardProfileCache) {
    return tarotCardProfileCache;
  }

  const tree = getCanonicalTree({
    system: "kaabalah",
    parts: ["westernAstrology", "tarot"]
  });
  const availableDeckIds = TAROT_DECK_METADATA.map((deck) => deck.id);

  const profiles = ARKANNUS.map((card) => {
    const tarotArkAnnuId = id(TarotTypes.TAROT_ARK_ANNU, card.tarotCard);
    const tarotArkAnnu = tree.getNode(tarotArkAnnuId);

    if (!tarotArkAnnu) {
      throw new Error(`Missing canonical tarot metadata for ${tarotArkAnnuId}.`);
    }

    const descriptionsByDeck = buildDescriptionsByDeck(tarotArkAnnu);

    return {
      tarotArkAnnuId,
      tarotCardNumber: card.number,
      tarotCardName: card.tarotCard,
      tarotCardFilename: card.tarotCardFilename,
      tarotMeaning:
        descriptionsByDeck.papus_pt?.meaning ??
        card.meaning,
      kind: toTarotCardKind(card),
      assetPathType: toTarotAssetPathType(card),
      suit: card.suit,
      courtRank: toTarotCourtRank(card),
      availableDeckIds,
      descriptionsByDeck
    };
  });

  tarotCardProfileCache = {
    profiles,
    byTarotArkAnnuId: new Map(
      profiles.map((profile) => [String(profile.tarotArkAnnuId), profile])
    ),
    byTarotCardName: new Map(
      profiles.map((profile) => [
        normalizeTarotLookupKey(profile.tarotCardName),
        profile
      ])
    ),
    byTarotCardFilename: new Map(
      profiles.map((profile) => [
        normalizeTarotLookupKey(profile.tarotCardFilename),
        profile
      ])
    ),
    byTarotCardNumber: new Map(
      profiles.map((profile) => [profile.tarotCardNumber, profile])
    )
  };

  return tarotCardProfileCache;
}

function buildTarotRepresentation(
  card: TarotCardProfile,
  deck: TarotDeckConfig
): TarotRepresentation {
  const description = card.descriptionsByDeck[deck.id];
  const assetPath = buildTarotAssetPath(card);
  const imageUrl = `${TAROT_IMAGE_BASE_URL}/${deck.id}/${assetPath}.jpg`;

  return {
    card,
    archetype: card.kind === "major"
      ? getTarotArchetype({ tarotCardNumber: card.tarotCardNumber })
      : undefined,
    deck: { id: deck.id, label: deck.label },
    assetPath,
    imageUrl,
    label: `${card.tarotCardName} - ${deck.label}`,
    altText: `${card.tarotCardName} - ${deck.label}`,
    cardLabel: description?.name ?? card.tarotCardName,
    description
  };
}

function resolveTarotArkAnnuId(
  lookup: TarotImageLookup
): NodeId<TarotTypes.TAROT_ARK_ANNU> | undefined {
  if ("pathSlug" in lookup || "pathId" in lookup) {
    return getTarotArchetype(lookup)?.tarotArkAnnuId;
  }

  if ("tarotArkAnnuId" in lookup) {
    return lookup.tarotArkAnnuId;
  }

  if ("tarotCardName" in lookup) {
    return TAROT_ARK_ANNU_ID_BY_NAME.get(
      normalizeTarotLookupKey(lookup.tarotCardName)
    );
  }

  if ("tarotCardFilename" in lookup) {
    return TAROT_ARK_ANNU_ID_BY_FILENAME.get(
      normalizeTarotLookupKey(lookup.tarotCardFilename)
    );
  }

  return undefined;
}

export function getTarotCardProfile(
  lookup: TarotImageLookup
): TarotCardProfile | undefined {
  const cache = getTarotCardProfileCache();

  if ("pathSlug" in lookup || "pathId" in lookup) {
    const archetype = getTarotArchetype(lookup);
    return archetype
      ? cache.byTarotCardNumber.get(archetype.tarotCardNumber)
      : undefined;
  }

  if ("tarotArkAnnuId" in lookup) {
    return cache.byTarotArkAnnuId.get(String(lookup.tarotArkAnnuId));
  }

  if ("tarotCardName" in lookup) {
    return cache.byTarotCardName.get(
      normalizeTarotLookupKey(lookup.tarotCardName)
    );
  }

  if ("tarotCardFilename" in lookup) {
    return cache.byTarotCardFilename.get(
      normalizeTarotLookupKey(lookup.tarotCardFilename)
    );
  }

  return getTarotCardByNumber(lookup.tarotCardNumber);
}

export function listTarotDecks(): TarotDeckMetadata[] {
  return TAROT_DECK_METADATA.map(({ id, label }) => ({ id, label }));
}

export function listTarotTrees(): TarotTreeId[] {
  return [...TAROT_TREE_IDS];
}

export function getTarotCardNumber(
  lookup: TarotImageLookup,
  treeId: TarotTreeId = DEFAULT_TAROT_TREE_ID
): number | undefined {
  if ("tarotCardNumber" in lookup) {
    return getTarotCardByNumber(lookup.tarotCardNumber, treeId)
      ?.tarotCardNumber;
  }

  const tarotArkAnnuId = resolveTarotArkAnnuId(lookup);

  if (!tarotArkAnnuId) {
    return undefined;
  }

  return getDirectTarotCardNumber(tarotArkAnnuId, treeId);
}

export function getTarotCardByNumber(
  cardNumber: number,
  treeId: TarotTreeId = DEFAULT_TAROT_TREE_ID
): TarotCardProfile | undefined {
  const tree = getTarotTreeWorkspace(treeId);

  if (!tree) {
    return undefined;
  }

  const match = tree.getCorrespondences(id(NumerologyTypes.NUMBER, cardNumber), {
    type: TarotTypes.TAROT_ARK_ANNU,
    depth: 1,
    limit: 1
  })[0];

  if (!match) {
    return undefined;
  }

  const profile = getTarotCardProfile({
    tarotArkAnnuId: match.node.id as NodeId<TarotTypes.TAROT_ARK_ANNU>
  });

  if (!profile || profile.tarotCardNumber === cardNumber) {
    return profile;
  }

  return {
    ...profile,
    tarotCardNumber: cardNumber
  };
}

export function getTarotArchetype(
  lookup: TarotArchetypeLookup
): TarotArchetype | undefined {
  const cache = getTarotArchetypeCache();

  if ("pathSlug" in lookup) {
    return cache.byPathSlug.get(normalizePathSlug(lookup.pathSlug));
  }

  if ("pathId" in lookup) {
    return cache.byPathId.get(String(lookup.pathId));
  }

  if ("tarotCardFilename" in lookup) {
    return cache.byTarotCardFilename.get(
      lookup.tarotCardFilename.toLowerCase()
    );
  }

  return cache.byTarotCardNumber.get(lookup.tarotCardNumber);
}

export function getTarotCorrespondenceProfile(
  lookup: TarotImageLookup,
  treeId: TarotTreeId = DEFAULT_TAROT_TREE_ID
): TarotCorrespondenceProfile | undefined {
  const card = resolveTarotCardProfileForTree(lookup, treeId);

  if (!card) {
    return undefined;
  }

  const tree = getTarotCorrespondenceTree(treeId);

  switch (card.kind) {
    case "major":
      return buildMajorCorrespondenceProfile(card, tree);
    case "court":
      return buildCourtCorrespondenceProfile(card, tree);
    case "minor":
      return buildMinorCorrespondenceProfile(card, tree);
  }
}

export function getTarotRepresentations(
  lookup: TarotImageLookup
): TarotRepresentation[] {
  const card = getTarotCardProfile(lookup);

  if (!card) {
    return [];
  }

  return TAROT_DECK_METADATA.map((deck) =>
    buildTarotRepresentation(card, deck)
  );
}

export function getTarotRepresentation(
  lookup: TarotImageLookup,
  deckId: TarotDeckId
): TarotRepresentation | undefined {
  const card = getTarotCardProfile(lookup);
  const deck = TAROT_DECK_METADATA.find((candidate) => candidate.id === deckId);

  if (!card || !deck) {
    return undefined;
  }

  return buildTarotRepresentation(card, deck);
}

export function resolveTarotImageUrl(
  lookup: TarotImageLookup,
  deckId: TarotDeckId
): string | undefined {
  return getTarotRepresentation(lookup, deckId)?.imageUrl;
}
