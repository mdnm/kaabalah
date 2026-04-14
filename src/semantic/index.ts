import {
  getCanonicalTree,
  id,
  KaabalahTypes,
  parseId,
  TarotTypes,
  type Node,
  type NodeData,
  type NodeId,
  type NodeType,
  WESTERN_HOUSES,
  WesternAstrologyTypes,
} from "../core"
import {
  ARKANNUS,
  getTarotArchetype,
  type TarotCard,
} from "../tarot"

export const OCCULT_THEME_STOPWORDS = [
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "was",
  "were",
  "been",
  "have",
  "has",
  "had",
  "just",
  "from",
  "into",
  "about",
  "over",
  "under",
  "very",
  "more",
  "less",
  "then",
  "than",
  "when",
  "what",
  "where",
  "which",
  "while",
  "would",
  "could",
  "should",
  "again",
  "still",
  "really",
  "gotta",
  "lota",
  "lotta",
  "para",
  "com",
  "sem",
  "por",
  "uma",
  "um",
  "uns",
  "das",
  "dos",
  "del",
  "que",
  "não",
  "nao",
  "isso",
  "essa",
  "este",
  "esta",
  "como",
  "mais",
  "menos",
  "muito",
  "muita",
  "their",
  "your",
  "mine",
  "ours",
  "onto",
  "sobre",
  "entre",
  "depois",
  "antes",
] as const

export interface TokenizeOccultThemeTextOptions {
  minTokenLength?: number;
  stopwords?: readonly string[];
}

export interface OccultThemeCorrespondence<T extends NodeType> {
  id: NodeId<T>;
  label: string;
  distance: number;
}

export interface OccultThemeCorrespondences {
  planets: readonly OccultThemeCorrespondence<WesternAstrologyTypes.PLANET>[];
  signs: readonly OccultThemeCorrespondence<WesternAstrologyTypes.WESTERN_ZODIAC_SIGN>[];
  elements: readonly OccultThemeCorrespondence<WesternAstrologyTypes.WESTERN_ELEMENT>[];
  spheres: readonly OccultThemeCorrespondence<KaabalahTypes.SPHERE>[];
  paths: readonly OccultThemeCorrespondence<KaabalahTypes.PATH>[];
}

export type HouseThemeScope = "personal" | "transition" | "transpersonal"

export interface HouseThemeAxis {
  key:
    | "self-other"
    | "resources-initiation"
    | "communication-journey"
    | "private-public"
    | "pleasure-friendship"
    | "health-occult";
  label: string;
  oppositeHouseNumber: HouseNumber;
}

export type HouseNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12

export type HouseThemeLookup =
  | HouseNumber
  | NodeId<WesternAstrologyTypes.HOUSE>;

export interface HouseThemeProfile {
  kind: "house";
  id: NodeId<WesternAstrologyTypes.HOUSE>;
  houseNumber: HouseNumber;
  houseLabel: string;
  primaryLabel: string;
  scope: HouseThemeScope;
  axis: HouseThemeAxis;
  aliases: readonly string[];
  keywords: readonly string[];
  tokens: readonly string[];
  correspondences: OccultThemeCorrespondences;
}

export interface TarotMajorArchetypeReference {
  pathId: NodeId<KaabalahTypes.PATH>;
  pathNumber: number;
  pathSlug: string;
  hebrewLetter: string;
}

export interface TarotThemeCorrespondences extends OccultThemeCorrespondences {
  suits: readonly OccultThemeCorrespondence<TarotTypes.TAROT_SUIT>[];
}

export type TarotThemeLookup =
  | number
  | string
  | { tarotCardNumber: number }
  | { tarotCardFilename: string }
  | { tarotCardName: string }
  | { tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU> }
  | { pathId: NodeId<KaabalahTypes.PATH> }
  | { pathSlug: string };

export interface TarotThemeProfile {
  kind: "tarot";
  id: NodeId<TarotTypes.TAROT_ARK_ANNU>;
  cardNumber: number;
  cardType: TarotCard["type"];
  tarotCardFilename: string;
  primaryLabel: string;
  aliases: readonly string[];
  keywords: readonly string[];
  tokens: readonly string[];
  correspondences: TarotThemeCorrespondences;
  majorArchetype?: TarotMajorArchetypeReference;
}

type HouseThemeSeed = {
  primaryLabel: string;
  scope: HouseThemeScope;
  aliases: readonly string[];
  keywords: readonly string[];
}

type TarotThemeProfileCache = {
  profiles: readonly TarotThemeProfile[];
  byId: Map<string, TarotThemeProfile>;
  byCardNumber: Map<number, TarotThemeProfile>;
  byFilename: Map<string, TarotThemeProfile>;
  byName: Map<string, TarotThemeProfile>;
  byPathId: Map<string, TarotThemeProfile>;
  byPathSlug: Map<string, TarotThemeProfile>;
}

const canonicalTree = getCanonicalTree({
  system: "kaabalah",
  parts: ["westernAstrology", "tarot"],
})

const HOUSE_LABELS_BY_NUMBER = [
  WESTERN_HOUSES.ASCENDANT,
  WESTERN_HOUSES.SECOND_HOUSE,
  WESTERN_HOUSES.THIRD_HOUSE,
  WESTERN_HOUSES.IMUM_COELI,
  WESTERN_HOUSES.FIFTH_HOUSE,
  WESTERN_HOUSES.SIXTH_HOUSE,
  WESTERN_HOUSES.DESCENDANT,
  WESTERN_HOUSES.EIGHTH_HOUSE,
  WESTERN_HOUSES.NINTH_HOUSE,
  WESTERN_HOUSES.MEDIUM_COELI,
  WESTERN_HOUSES.ELEVENTH_HOUSE,
  WESTERN_HOUSES.TWELFTH_HOUSE,
] as const

const HOUSE_THEME_SEEDS: Record<HouseNumber, HouseThemeSeed> = {
  1: {
    primaryLabel: "Images",
    scope: "personal",
    aliases: [
      "First House",
      "House 1",
      "Casa 1",
      "Imagens",
      "Como me vejo e como outros me veem",
      "Self-image",
    ],
    keywords: [
      "images",
      "imagens",
      "identity",
      "self-image",
      "appearance",
      "body",
      "personality",
      "first impression",
      "persona",
      "character",
      "personagem",
      "how I see myself",
      "how others see me",
    ],
  },
  2: {
    primaryLabel: "Money",
    scope: "personal",
    aliases: ["Second House", "House 2", "Casa 2", "Dinheiro", "Resources"],
    keywords: [
      "money",
      "dinheiro",
      "resources",
      "income",
      "finances",
      "possessions",
      "values",
      "material values",
      "self-worth",
    ],
  },
  3: {
    primaryLabel: "Communication",
    scope: "personal",
    aliases: ["Third House", "House 3", "Casa 3", "Comunicação", "Comunicações"],
    keywords: [
      "communication",
      "comunicação",
      "comunicações",
      "siblings",
      "writing",
      "language",
      "study",
      "neighborhood",
      "short trips",
      "early education",
      "mind",
    ],
  },
  4: {
    primaryLabel: "Family",
    scope: "personal",
    aliases: [
      "Fourth House",
      "House 4",
      "Casa 4",
      "IC",
      "Home Angle",
      "Família",
      "Famílias",
      "Family (not only blood)",
      "Familia (não só de sangue)",
    ],
    keywords: [
      "family",
      "familia",
      "families",
      "famílias",
      "home",
      "roots",
      "belonging",
      "kinship",
      "chosen family",
      "vida íntima",
      "inner foundation",
      "private life",
    ],
  },
  5: {
    primaryLabel: "Hobbies",
    scope: "personal",
    aliases: ["Fifth House", "House 5", "Casa 5", "Hobbies", "Lazer", "Pleasures"],
    keywords: [
      "hobbies",
      "hobby",
      "lazer",
      "pleasure",
      "fun",
      "games",
      "creative leisure",
      "creativity",
      "children",
      "romance",
      "speculation",
    ],
  },
  6: {
    primaryLabel: "Health",
    scope: "personal",
    aliases: ["Sixth House", "House 6", "Casa 6", "Saúde", "Health"],
    keywords: [
      "health",
      "saúde",
      "routine",
      "service",
      "care",
      "wellbeing",
      "body maintenance",
      "daily work",
      "pets",
    ],
  },
  7: {
    primaryLabel: "Associations",
    scope: "transition",
    aliases: [
      "Seventh House",
      "House 7",
      "Casa 7",
      "Associações",
      "Partnerships",
      "Associations",
    ],
    keywords: [
      "associations",
      "associações",
      "partnerships",
      "partners",
      "alliances",
      "cooperation",
      "the other",
      "relationships",
      "marriage",
      "contracts",
      "open enemies",
    ],
  },
  8: {
    primaryLabel: "Sex and Initiations",
    scope: "transpersonal",
    aliases: [
      "Eighth House",
      "House 8",
      "Casa 8",
      "Sexo",
      "Iniciações",
      "Sexo / Iniciações",
    ],
    keywords: [
      "sex",
      "sexo",
      "initiations",
      "iniciações",
      "transformation",
      "transmutations",
      "taboo",
      "death",
      "shared resources",
      "sexuality",
      "occult",
      "death rebirth",
    ],
  },
  9: {
    primaryLabel: "Travel and Knowledge",
    scope: "transpersonal",
    aliases: [
      "Ninth House",
      "House 9",
      "Casa 9",
      "Viagens",
      "Travel",
      "Travel, Religion, Philosophy, Knowledge",
    ],
    keywords: [
      "travel",
      "viagens",
      "religion",
      "religião",
      "philosophy",
      "filosofia",
      "knowledge",
      "conhecimento",
      "higher studies",
      "higher education",
      "publishing",
      "law",
    ],
  },
  10: {
    primaryLabel: "Career and Work",
    scope: "transpersonal",
    aliases: [
      "Tenth House",
      "House 10",
      "Casa 10",
      "Midheaven",
      "MC",
      "Carreira",
      "Trabalho",
    ],
    keywords: [
      "career",
      "carreira",
      "work",
      "trabalho",
      "profession",
      "reputation",
      "vocation",
      "public life",
      "public image",
      "ambition",
      "authority",
      "legacy",
    ],
  },
  11: {
    primaryLabel: "Friends",
    scope: "transpersonal",
    aliases: ["Eleventh House", "House 11", "Casa 11", "Friends", "Amigos", "Relações"],
    keywords: [
      "friends",
      "amigos",
      "friendships",
      "relations",
      "network",
      "community",
      "groups",
      "projects",
      "ideals",
      "hopes",
      "humanitarian goals",
    ],
  },
  12: {
    primaryLabel: "Past Lives",
    scope: "transpersonal",
    aliases: [
      "Twelfth House",
      "House 12",
      "Casa 12",
      "Vida passada",
      "Vidas passadas",
      "Past life",
      "Past lives",
      "Oculto",
    ],
    keywords: [
      "past life",
      "past lives",
      "vida passada",
      "vidas passadas",
      "karma",
      "occult",
      "hidden",
      "unconscious",
      "spiritual memory",
      "isolation",
      "spirituality",
      "hidden enemies",
      "self undoing",
    ],
  },
}

const TAROT_SUIT_ALIASES: Partial<Record<NonNullable<TarotCard["suit"]>, readonly string[]>> = {
  wands: ["Rods", "Staves", "Paus"],
  cups: ["Chalices", "Copas"],
  swords: ["Blades", "Espadas"],
  pentacles: ["Coins", "Disks", "Discs", "Ouros"],
}

const TAROT_SUIT_THEME_KEYWORDS: Partial<Record<NonNullable<TarotCard["suit"]>, readonly string[]>> = {
  wands: [
    "paus",
    "fire",
    "will",
    "inspiration",
    "creation",
    "force",
    "vigor",
    "initiative",
    "progress",
    "thinking",
    "associating ideas",
    "seeking results",
    "politicians",
    "workers",
    "producers",
    "salamanders",
  ],
  cups: [
    "copas",
    "water",
    "feelings",
    "emotions",
    "receptivity",
    "sensitivity",
    "ideals",
    "love",
    "artistic creation",
    "feeling",
    "affective",
    "relational",
    "emotional",
    "clergy",
    "spiritual class",
    "ondines",
    "mermaids",
  ],
  swords: [
    "espadas",
    "air",
    "thought",
    "intelligence",
    "exchanges",
    "cooperation of opposites",
    "maturity",
    "balance",
    "intuition",
    "sixth sense",
    "imagination",
    "future vision",
    "military",
    "warriors",
    "police",
    "sylphs",
    "giants",
  ],
  pentacles: [
    "ouros",
    "earth",
    "concretization",
    "manifestation",
    "practical intelligence",
    "effort",
    "study",
    "gains",
    "business",
    "sensation",
    "five senses",
    "concrete perception",
    "present",
    "bourgeoisie",
    "finances",
    "commerce",
    "gnomes",
  ],
}

const TAROT_COURT_RANK_THEME_KEYWORDS: Partial<Record<string, readonly string[]>> = {
  king: ["dynamic", "active", "lordly", "cardinal"],
  queen: ["stable", "receptive", "contained", "fixed"],
  knight: ["volatile", "mutant", "active", "mutable"],
  page: ["nascent", "fragile", "beginning", "starting"],
}

const TAROT_MINOR_PIP_STAGE_KEYWORDS: Partial<Record<string, readonly string[]>> = {
  ace: ["will", "pure potential", "something new emerging", "first spark"],
  two: ["imagining", "visualizing", "formulating the idea"],
  three: ["speaking", "understanding", "verbalizing", "giving form"],
  four: ["expanding", "planning", "growth", "good feelings"],
  five: ["restricting", "discipline", "justice", "pruning", "confronting limits"],
  six: ["harmonizing", "beauty", "ethics", "balance", "heart"],
  seven: ["winning silently", "emotional control", "quiet victory", "endurance"],
  eight: ["connecting", "rational control", "linking concepts", "strategy"],
  nine: ["foundations", "worthy", "solid base"],
  ten: ["manifesting", "materialized", "completion"],
}

let houseThemeProfilesCache: readonly HouseThemeProfile[] | undefined
let tarotThemeProfilesCache: TarotThemeProfileCache | undefined

function getHouseThemeAxis(houseNumber: HouseNumber): HouseThemeAxis {
  const axisPairs: Record<HouseNumber, HouseThemeAxis> = {
    1: { key: "self-other", label: "Self and Other", oppositeHouseNumber: 7 },
    2: { key: "resources-initiation", label: "Resources and Initiation", oppositeHouseNumber: 8 },
    3: { key: "communication-journey", label: "Communication and Journey", oppositeHouseNumber: 9 },
    4: { key: "private-public", label: "Private and Public Life", oppositeHouseNumber: 10 },
    5: { key: "pleasure-friendship", label: "Pleasure and Friendship", oppositeHouseNumber: 11 },
    6: { key: "health-occult", label: "Health and the Occult", oppositeHouseNumber: 12 },
    7: { key: "self-other", label: "Self and Other", oppositeHouseNumber: 1 },
    8: { key: "resources-initiation", label: "Resources and Initiation", oppositeHouseNumber: 2 },
    9: { key: "communication-journey", label: "Communication and Journey", oppositeHouseNumber: 3 },
    10: { key: "private-public", label: "Private and Public Life", oppositeHouseNumber: 4 },
    11: { key: "pleasure-friendship", label: "Pleasure and Friendship", oppositeHouseNumber: 5 },
    12: { key: "health-occult", label: "Health and the Occult", oppositeHouseNumber: 6 },
  }

  return axisPairs[houseNumber]
}

function normalizeThemeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function uniqueStrings(values: Iterable<string | null | undefined>) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const trimmed = value?.trim()

    if (!trimmed || seen.has(trimmed)) {
      continue
    }

    seen.add(trimmed)
    result.push(trimmed)
  }

  return result
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(" ")
}

function humanizeTarotFilename(filename: string) {
  return titleCase(
    filename
      .replace(/^\d+_/, "")
      .replace(/_/g, " ")
  )
}

function getNodeDisplayLabel<T extends NodeType>(node: Node<T>) {
  const parsedId = parseId(node.id)

  if (node.type === KaabalahTypes.PATH) {
    return `Path ${parsedId}`
  }

  if (node.type === TarotTypes.TAROT_SUIT) {
    return titleCase(parsedId)
  }

  return node.name ?? titleCase(parsedId)
}

function getNodeTextCandidates<T extends NodeType>(node: Node<T>) {
  const data = node.data as Record<string, unknown> | undefined

  return uniqueStrings([
    getNodeDisplayLabel(node),
    parseId(node.id),
    typeof data?.englishName === "string" ? data.englishName : undefined,
    typeof data?.meaning === "string" ? data.meaning : undefined,
  ])
}

function getCorrespondenceRefs<T extends NodeType>(
  nodeId: NodeId<NodeType>,
  type: T,
  depth: number
): OccultThemeCorrespondence<T>[] {
  return canonicalTree
    .getCorrespondences(nodeId, { type, depth })
    .map((match) => ({
      id: match.node.id as NodeId<T>,
      label: getNodeDisplayLabel(match.node as Node<T>),
      distance: match.distance,
    }))
}

function collectCorrespondenceTexts<T extends NodeType>(
  correspondences: readonly OccultThemeCorrespondence<T>[]
) {
  const texts: string[] = []

  for (const correspondence of correspondences) {
    const node = canonicalTree.getNode(correspondence.id)

    if (!node) {
      continue
    }

    texts.push(...getNodeTextCandidates(node))
  }

  return texts
}

function freezeCorrespondences<T extends NodeType>(
  correspondences: OccultThemeCorrespondence<T>[]
) {
  correspondences.forEach((correspondence) => Object.freeze(correspondence))
  return Object.freeze(correspondences) as readonly OccultThemeCorrespondence<T>[]
}

function createTokenSurface(values: Iterable<string | null | undefined>) {
  return tokenizeOccultThemeText([...values])
}

function getHouseLabelFromLookup(lookup: HouseThemeLookup) {
  if (typeof lookup === "number") {
    return HOUSE_LABELS_BY_NUMBER[lookup - 1]
  }

  if (String(lookup).startsWith(`${WesternAstrologyTypes.HOUSE}:`)) {
    return parseId(lookup)
  }

  return undefined
}

function buildHouseThemeProfile(houseNumber: HouseNumber): HouseThemeProfile {
  const houseLabel = HOUSE_LABELS_BY_NUMBER[houseNumber - 1]
  const houseId = id(WesternAstrologyTypes.HOUSE, houseLabel)
  const seed = HOUSE_THEME_SEEDS[houseNumber]
  const primaryLabel = seed.primaryLabel
  const axis = getHouseThemeAxis(houseNumber)
  const aliases = uniqueStrings(seed.aliases)
  const signs = getCorrespondenceRefs(houseId, WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, 1)
  const planets = getCorrespondenceRefs(houseId, WesternAstrologyTypes.PLANET, 2)
  const elements = getCorrespondenceRefs(houseId, WesternAstrologyTypes.WESTERN_ELEMENT, 2)
  const spheres = getCorrespondenceRefs(houseId, KaabalahTypes.SPHERE, 2)
  const paths = getCorrespondenceRefs(houseId, KaabalahTypes.PATH, 2)

  const correspondenceTexts = [
    ...collectCorrespondenceTexts(signs),
    ...collectCorrespondenceTexts(planets),
    ...collectCorrespondenceTexts(elements),
    ...collectCorrespondenceTexts(spheres),
    ...collectCorrespondenceTexts(paths),
  ]

  const keywords = uniqueStrings(seed.keywords)
  const tokens = createTokenSurface([
    primaryLabel,
    ...aliases,
    ...keywords,
    ...correspondenceTexts,
  ])

  const profile: HouseThemeProfile = {
    kind: "house",
    id: houseId,
    houseNumber,
    houseLabel: titleCase(houseLabel),
    primaryLabel,
    scope: seed.scope,
    axis: Object.freeze(axis),
    aliases: Object.freeze(aliases),
    keywords: Object.freeze(keywords),
    tokens: Object.freeze(tokens),
    correspondences: Object.freeze({
      planets: freezeCorrespondences(planets),
      signs: freezeCorrespondences(signs),
      elements: freezeCorrespondences(elements),
      spheres: freezeCorrespondences(spheres),
      paths: freezeCorrespondences(paths),
    }),
  }

  return Object.freeze(profile)
}

function getHouseThemeProfileCache() {
  if (houseThemeProfilesCache) {
    return houseThemeProfilesCache
  }

  houseThemeProfilesCache = Object.freeze(HOUSE_LABELS_BY_NUMBER.map((_, index) =>
    buildHouseThemeProfile((index + 1) as HouseNumber)
  ))

  return houseThemeProfilesCache
}

function getTarotRank(card: TarotCard) {
  if (!card.tarotCard.includes(" of ")) {
    return undefined
  }

  return card.tarotCard.split(" of ")[0].toLowerCase()
}

function buildTarotAliases(
  card: TarotCard,
  majorArchetype?: TarotThemeProfile["majorArchetype"],
  descriptiveData?: NodeData<TarotTypes.TAROT_ARK_ANNU>["descriptiveData"]
) {
  const normalizedPrimaryLabel = normalizeThemeText(card.tarotCard)
  const cardNode = canonicalTree.getNode(id(TarotTypes.TAROT_ARK_ANNU, card.tarotCard))
  const aliases: Array<string | undefined> = [
    humanizeTarotFilename(card.tarotCardFilename),
    card.egyptianCardName,
    ...Object.values(descriptiveData ?? {}).map((description) => description?.name),
    ...(cardNode?.data?.aliases ?? []),
  ]

  if (majorArchetype) {
    aliases.push(titleCase(majorArchetype.pathSlug))
  }

  if (card.suit && card.tarotCard.includes(" of ")) {
    const rankLabel = card.tarotCard.split(" of ")[0]

    for (const suitAlias of TAROT_SUIT_ALIASES[card.suit] ?? []) {
      aliases.push(`${rankLabel} of ${suitAlias}`)
    }
  }

  return uniqueStrings(
    aliases
      .filter((alias): alias is string => Boolean(alias))
      .filter((alias) => normalizeThemeText(alias) !== normalizedPrimaryLabel)
  )
}

function buildTarotKeywordTexts(
  card: TarotCard,
  majorArchetype?: TarotThemeProfile["majorArchetype"],
  descriptiveData?: NodeData<TarotTypes.TAROT_ARK_ANNU>["descriptiveData"]
) {
  const rank = getTarotRank(card)
  const deckKeywordTexts = Object.values(descriptiveData ?? {}).flatMap((description) => [
    description?.meaning,
    description?.reversedMeaning,
    ...(description?.keywords ?? []),
  ])

  return uniqueStrings([
    card.meaning,
    card.papusMeaning,
    card.egyptianCardName,
    ...(canonicalTree.getNode(id(TarotTypes.TAROT_ARK_ANNU, card.tarotCard))?.data?.keywords ?? []),
    ...deckKeywordTexts,
    ...(card.suit ? TAROT_SUIT_THEME_KEYWORDS[card.suit] ?? [] : []),
    ...(card.type === "minor" && rank ? TAROT_MINOR_PIP_STAGE_KEYWORDS[rank] ?? [] : []),
    ...(rank ? TAROT_COURT_RANK_THEME_KEYWORDS[rank] ?? [] : []),
    majorArchetype?.hebrewLetter,
  ])
}

function buildTarotThemeProfile(card: TarotCard): TarotThemeProfile {
  const cardId = id(TarotTypes.TAROT_ARK_ANNU, card.tarotCard)
  const cardNode = canonicalTree.getNode(cardId)

  if (!cardNode) {
    throw new Error(`Missing canonical tarot node for ${cardId}.`)
  }

  const majorArchetypeData = card.type === "major"
    ? getTarotArchetype({ tarotCardNumber: card.number })
    : undefined
  const majorArchetype = majorArchetypeData
    ? {
        pathId: majorArchetypeData.pathId,
        pathNumber: majorArchetypeData.pathNumber,
        pathSlug: majorArchetypeData.pathSlug,
        hebrewLetter: majorArchetypeData.hebrewLetter,
      }
    : undefined
  const aliases = buildTarotAliases(
    card,
    majorArchetype,
    cardNode.data?.descriptiveData
  )
  const suits = getCorrespondenceRefs(cardId, TarotTypes.TAROT_SUIT, 1)
  const planets = getCorrespondenceRefs(cardId, WesternAstrologyTypes.PLANET, 3)
  const signs = getCorrespondenceRefs(cardId, WesternAstrologyTypes.WESTERN_ZODIAC_SIGN, 3)
  const elements = getCorrespondenceRefs(cardId, WesternAstrologyTypes.WESTERN_ELEMENT, 3)
  const spheres = getCorrespondenceRefs(cardId, KaabalahTypes.SPHERE, 3)
  const paths = getCorrespondenceRefs(cardId, KaabalahTypes.PATH, 2)
  const keywordTexts = buildTarotKeywordTexts(
    card,
    majorArchetype,
    cardNode.data?.descriptiveData
  )
  const keywords = createTokenSurface(keywordTexts)
  const correspondenceTexts = [
    ...collectCorrespondenceTexts(suits),
    ...collectCorrespondenceTexts(planets),
    ...collectCorrespondenceTexts(signs),
    ...collectCorrespondenceTexts(elements),
    ...collectCorrespondenceTexts(spheres),
    ...collectCorrespondenceTexts(paths),
  ]
  const tokens = uniqueStrings([
    ...keywords,
    ...createTokenSurface([
      card.tarotCard,
      ...aliases,
      ...correspondenceTexts,
      card.suit,
      majorArchetype?.pathSlug,
    ]),
  ])

  const profile: TarotThemeProfile = {
    kind: "tarot",
    id: cardId,
    cardNumber: card.number,
    cardType: card.type,
    tarotCardFilename: card.tarotCardFilename,
    primaryLabel: card.tarotCard,
    aliases: Object.freeze(aliases),
    keywords: Object.freeze(keywords),
    tokens: Object.freeze(tokens),
    correspondences: Object.freeze({
      planets: freezeCorrespondences(planets),
      signs: freezeCorrespondences(signs),
      elements: freezeCorrespondences(elements),
      spheres: freezeCorrespondences(spheres),
      paths: freezeCorrespondences(paths),
      suits: freezeCorrespondences(suits),
    }),
    majorArchetype: majorArchetype ? Object.freeze(majorArchetype) : undefined,
  }

  return Object.freeze(profile)
}

function getTarotThemeProfileCache(): TarotThemeProfileCache {
  if (tarotThemeProfilesCache) {
    return tarotThemeProfilesCache
  }

  const profiles = Object.freeze(ARKANNUS.map((card) => buildTarotThemeProfile(card)))

  tarotThemeProfilesCache = {
    profiles,
    byId: new Map(profiles.map((profile) => [profile.id, profile])),
    byCardNumber: new Map(profiles.map((profile) => [profile.cardNumber, profile])),
    byFilename: new Map(
      profiles.map((profile) => [normalizeThemeText(profile.tarotCardFilename), profile])
    ),
    byName: new Map(
      profiles.flatMap((profile) => [
        [normalizeThemeText(profile.primaryLabel), profile] as const,
        ...profile.aliases.map((alias) => [normalizeThemeText(alias), profile] as const),
      ])
    ),
    byPathId: new Map(
      profiles.flatMap((profile) =>
        profile.majorArchetype
          ? [[profile.majorArchetype.pathId, profile] as const]
          : []
      )
    ),
    byPathSlug: new Map(
      profiles.flatMap((profile) =>
        profile.majorArchetype
          ? [[normalizeThemeText(profile.majorArchetype.pathSlug), profile] as const]
          : []
      )
    ),
  }

  return tarotThemeProfilesCache
}

export function tokenizeOccultThemeText(
  input: string | null | undefined | readonly (string | null | undefined)[],
  options: TokenizeOccultThemeTextOptions = {}
) {
  const values = Array.isArray(input) ? input : [input]
  const minTokenLength = options.minTokenLength ?? 3
  const stopwords = new Set((options.stopwords ?? OCCULT_THEME_STOPWORDS).map(normalizeThemeText))
  const seen = new Set<string>()
  const tokens: string[] = []

  for (const value of values) {
    if (!value) {
      continue
    }

    const normalized = normalizeThemeText(value)

    for (const token of normalized.split(/[^a-z0-9]+/)) {
      if (token.length < minTokenLength || stopwords.has(token) || seen.has(token)) {
        continue
      }

      seen.add(token)
      tokens.push(token)
    }
  }

  return tokens
}

export function listHouseThemeProfiles() {
  return getHouseThemeProfileCache()
}

export function getHouseThemeProfile(lookup: HouseThemeLookup) {
  const houseLabel = getHouseLabelFromLookup(lookup)

  if (!houseLabel) {
    return undefined
  }

  return getHouseThemeProfileCache().find((profile) => parseId(profile.id) === houseLabel)
}

export function listTarotThemeProfiles() {
  return getTarotThemeProfileCache().profiles
}

export function getTarotThemeProfile(lookup: TarotThemeLookup) {
  const cache = getTarotThemeProfileCache()

  if (typeof lookup === "number") {
    return cache.byCardNumber.get(lookup)
  }

  if (typeof lookup === "string") {
    if (lookup.startsWith(`${TarotTypes.TAROT_ARK_ANNU}:`)) {
      return cache.byId.get(lookup)
    }

    if (lookup.startsWith(`${KaabalahTypes.PATH}:`)) {
      const archetype = getTarotArchetype({
        pathId: lookup as NodeId<KaabalahTypes.PATH>,
      })

      return archetype ? cache.byCardNumber.get(archetype.tarotCardNumber) : undefined
    }

    return (
      cache.byFilename.get(normalizeThemeText(lookup)) ??
      cache.byName.get(normalizeThemeText(lookup)) ??
      cache.byPathSlug.get(normalizeThemeText(lookup))
    )
  }

  if ("tarotCardNumber" in lookup) {
    return cache.byCardNumber.get(lookup.tarotCardNumber)
  }

  if ("tarotCardFilename" in lookup) {
    return cache.byFilename.get(normalizeThemeText(lookup.tarotCardFilename))
  }

  if ("tarotCardName" in lookup) {
    return cache.byName.get(normalizeThemeText(lookup.tarotCardName))
  }

  if ("tarotArkAnnuId" in lookup) {
    return cache.byId.get(lookup.tarotArkAnnuId)
  }

  if ("pathId" in lookup) {
    return cache.byPathId.get(lookup.pathId)
  }

  return cache.byPathSlug.get(normalizeThemeText(lookup.pathSlug))
}
