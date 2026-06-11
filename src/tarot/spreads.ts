import { ARKANNUS } from "./arkannus";
import type { TarotCard, TarotDeckId } from "./data";

export type TarotSpreadId =
  | "quick-insight"
  | "conscious-reading"
  | "time-reading"
  | "dialectic-reading"
  | "tree-of-life-reading"
  | "celtic-cross"
  | "event-reading";

export type TarotSpreadContextKey = "inquirerGender";
export type TarotInquirerGender = "man" | "woman";
export type TarotSpreadCardType = TarotCard["type"];
export type TarotSpreadMinorRank =
  | "ace"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10";

export interface TarotSpreadCardConstraint {
  allowedTypes?: TarotSpreadCardType[];
  requiredRank?: TarotSpreadMinorRank;
  allowedCardFilenames?: string[];
  excludedCardFilenames?: string[];
}

export interface TarotSpreadSlotMetadata {
  displayLabel?: string;
  groupKey?: string;
  note?: string;
  orientation?: "upright" | "sideways";
  temporalPhase?: "past" | "present" | "future";
}

export interface TarotSpreadSlotDefinition {
  slotKey: string;
  label: string;
  order: number;
  minCards: number;
  maxCards: number;
  validationRules?: TarotSpreadCardConstraint;
  manualSelectionRules?: TarotSpreadCardConstraint;
  drawRules?: TarotSpreadCardConstraint;
  metadata?: TarotSpreadSlotMetadata;
}

export interface TarotSpreadInquirerRule {
  slotKey: string;
  sourceSlotKeys: string[];
  cardNumbersByGender: Record<TarotInquirerGender, number>;
}

export interface TarotSpreadDefinition {
  spreadId: TarotSpreadId;
  label: string;
  description?: string;
  contextRequirements?: TarotSpreadContextKey[];
  slots: TarotSpreadSlotDefinition[];
  specialRules?: {
    inquirerCard?: TarotSpreadInquirerRule;
  };
}

export interface TarotSpreadSelectionContext {
  inquirerGender?: TarotInquirerGender;
}

export interface TarotSpreadSelectionCard {
  slotKey: string;
  cardNumber: number;
  isInverted?: boolean;
}

export interface TarotSpreadResolvedSelectionCard
  extends TarotSpreadSelectionCard {
  card: TarotCard;
  slot: TarotSpreadSlotDefinition;
}

export type TarotSpreadValidationErrorCode =
  | "UNKNOWN_SPREAD"
  | "UNKNOWN_SLOT"
  | "CARD_NOT_FOUND"
  | "DUPLICATE_CARD"
  | "MISSING_REQUIRED_CARDS"
  | "TOO_MANY_CARDS"
  | "INVALID_CARD_TYPE"
  | "INVALID_CARD_RANK"
  | "DISALLOWED_CARD"
  | "MISSING_CONTEXT"
  | "INVALID_INQUIRER_CARD";

export interface TarotSpreadValidationIssue {
  code: TarotSpreadValidationErrorCode;
  message: string;
  slotKey?: string;
  cardNumber?: number;
}

export interface TarotSpreadValidationResult {
  ok: boolean;
  isComplete: boolean;
  spread?: TarotSpreadDefinition;
  resolvedCards: TarotSpreadResolvedSelectionCard[];
  errors: TarotSpreadValidationIssue[];
}

export interface TarotSpreadValidationInput {
  spreadId: TarotSpreadId;
  cards: TarotSpreadSelectionCard[];
  context?: TarotSpreadSelectionContext;
  allowPartial?: boolean;
}

export interface DrawTarotSpreadOptions {
  spreadId: TarotSpreadId;
  deckId?: TarotDeckId;
  includeInverted?: boolean;
  rng?: () => number;
  context?: TarotSpreadSelectionContext;
}

export interface TarotSpreadDrawResult {
  spread: TarotSpreadDefinition;
  deckId: TarotDeckId;
  context?: TarotSpreadSelectionContext;
  cards: TarotSpreadResolvedSelectionCard[];
}

const TAROT_SPREAD_MINOR_RANKS: readonly TarotSpreadMinorRank[] = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10"
];

const EVENT_INNER_SLOT_KEYS = [
  "inner-1",
  "inner-2",
  "inner-3",
  "inner-4",
  "inner-5",
  "inner-6",
  "inner-7"
] as const;

const TAROT_CARD_BY_NUMBER = new Map(
  ARKANNUS.map((card) => [card.number, card] as const)
);

function createEventOuterSlot(
  index: number,
  temporalPhase: TarotSpreadSlotMetadata["temporalPhase"]
): TarotSpreadSlotDefinition {
  return {
    slotKey: `outer-${index}`,
    label: String(index),
    order: index,
    minCards: 1,
    maxCards: 1,
    validationRules: {
      allowedTypes: ["minor", "daat+royalship"]
    },
    manualSelectionRules: {
      allowedTypes: ["minor", "daat+royalship"]
    },
    drawRules: {
      allowedTypes: ["minor", "daat+royalship"]
    },
    metadata: {
      displayLabel: String(index),
      groupKey: "outer",
      temporalPhase
    }
  };
}

function createEventInnerSlot(
  index: number,
  label: string,
  note: string
): TarotSpreadSlotDefinition {
  return {
    slotKey: `inner-${index}`,
    label,
    order: 100 + index,
    minCards: 1,
    maxCards: 1,
    validationRules: {
      allowedTypes: ["major"]
    },
    manualSelectionRules: {
      allowedTypes: ["major"],
      excludedCardFilenames: [
        "01_the_magician",
        "02_the_high_priestess"
      ]
    },
    drawRules: {
      allowedTypes: ["major"]
    },
    metadata: {
      displayLabel: `${index}.`,
      groupKey: "inner",
      note
    }
  };
}

const TAROT_SPREADS: readonly TarotSpreadDefinition[] = [
  {
    spreadId: "quick-insight",
    label: "Quick Insight",
    description: "A single-card reading for immediate insight.",
    slots: [
      {
        slotKey: "quick-insight",
        label: "Quick Insight",
        order: 1,
        minCards: 1,
        maxCards: 1
      }
    ]
  },
  {
    spreadId: "conscious-reading",
    label: "Conscious Reading",
    description:
      "Three-card spread for conscious, unconscious, and subconscious layers.",
    slots: [
      {
        slotKey: "conscious",
        label: "Conscious",
        order: 1,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "unconscious",
        label: "Unconscious",
        order: 2,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["daat+royalship"]
        },
        manualSelectionRules: {
          allowedTypes: ["daat+royalship"]
        },
        drawRules: {
          allowedTypes: ["daat+royalship"]
        }
      },
      {
        slotKey: "subconscious",
        label: "Subconscious",
        order: 3,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"]
        },
        manualSelectionRules: {
          allowedTypes: ["minor"]
        },
        drawRules: {
          allowedTypes: ["minor"]
        }
      }
    ]
  },
  {
    spreadId: "time-reading",
    label: "Time Reading",
    description: "Three major arcana cards for past, present, and future.",
    slots: [
      {
        slotKey: "past",
        label: "Past",
        order: 1,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "present",
        label: "Present",
        order: 2,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "future",
        label: "Future",
        order: 3,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      }
    ]
  },
  {
    spreadId: "dialectic-reading",
    label: "Dialectic Reading",
    description: "Three major arcana cards for thesis, antithesis, and synthesis.",
    slots: [
      {
        slotKey: "thesis",
        label: "Thesis",
        order: 1,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "antithesis",
        label: "Antithesis",
        order: 2,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      },
      {
        slotKey: "synthesis",
        label: "Synthesis",
        order: 3,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"]
        },
        drawRules: {
          allowedTypes: ["major"]
        }
      }
    ]
  },
  {
    spreadId: "tree-of-life-reading",
    label: "Tree of Life Reading",
    description:
      "Ten numbered minor arcana slots mapped to the spheres plus four Daath court cards.",
    slots: [
      {
        slotKey: "kether",
        label: "Kether",
        order: 1,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "ace"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "ace"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "ace"
        }
      },
      {
        slotKey: "chokhmah",
        label: "Chokhmah",
        order: 2,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "2"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "2"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "2"
        }
      },
      {
        slotKey: "binah",
        label: "Binah",
        order: 3,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "3"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "3"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "3"
        }
      },
      {
        slotKey: "chesed",
        label: "Chesed",
        order: 4,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "4"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "4"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "4"
        }
      },
      {
        slotKey: "geburah",
        label: "Geburah",
        order: 5,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "5"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "5"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "5"
        }
      },
      {
        slotKey: "tiphareth",
        label: "Tiphareth",
        order: 6,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "6"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "6"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "6"
        }
      },
      {
        slotKey: "netzach",
        label: "Netzach",
        order: 7,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "7"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "7"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "7"
        }
      },
      {
        slotKey: "hod",
        label: "Hod",
        order: 8,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "8"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "8"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "8"
        }
      },
      {
        slotKey: "yesod",
        label: "Yesod",
        order: 9,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "9"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "9"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "9"
        }
      },
      {
        slotKey: "malkuth",
        label: "Malkuth",
        order: 10,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["minor"],
          requiredRank: "10"
        },
        manualSelectionRules: {
          allowedTypes: ["minor"],
          requiredRank: "10"
        },
        drawRules: {
          allowedTypes: ["minor"],
          requiredRank: "10"
        }
      },
      {
        slotKey: "daath",
        label: "Daath",
        order: 11,
        minCards: 4,
        maxCards: 4,
        validationRules: {
          allowedTypes: ["daat+royalship"]
        },
        manualSelectionRules: {
          allowedTypes: ["daat+royalship"]
        },
        drawRules: {
          allowedTypes: ["daat+royalship"]
        }
      }
    ]
  },
  {
    spreadId: "celtic-cross",
    label: "Celtic Cross",
    description: "Classic ten-card Celtic Cross spread.",
    slots: [
      {
        slotKey: "present",
        label: "The Present",
        order: 1,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "1."
        }
      },
      {
        slotKey: "challenge",
        label: "The Challenge",
        order: 2,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "2.",
          orientation: "sideways"
        }
      },
      {
        slotKey: "above",
        label: "Above",
        order: 3,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "3."
        }
      },
      {
        slotKey: "below",
        label: "Below",
        order: 4,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "4."
        }
      },
      {
        slotKey: "behind",
        label: "Behind",
        order: 5,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "5."
        }
      },
      {
        slotKey: "before",
        label: "Before",
        order: 6,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "6."
        }
      },
      {
        slotKey: "self",
        label: "Self",
        order: 7,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "7."
        }
      },
      {
        slotKey: "environment",
        label: "Environment",
        order: 8,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "8."
        }
      },
      {
        slotKey: "hopes-fears",
        label: "Hopes/Fears",
        order: 9,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "9."
        }
      },
      {
        slotKey: "outcome",
        label: "Outcome",
        order: 10,
        minCards: 1,
        maxCards: 1,
        metadata: {
          displayLabel: "10."
        }
      }
    ]
  },
  {
    spreadId: "event-reading",
    label: "Event Reading",
    description:
      "Papus-style event spread with outer minor/court cards, seven major cards, and an inquirer card.",
    contextRequirements: ["inquirerGender"],
    slots: [
      createEventOuterSlot(1, "past"),
      createEventOuterSlot(2, "past"),
      createEventOuterSlot(3, "past"),
      createEventOuterSlot(4, "past"),
      createEventOuterSlot(5, "present"),
      createEventOuterSlot(6, "present"),
      createEventOuterSlot(7, "present"),
      createEventOuterSlot(8, "present"),
      createEventOuterSlot(9, "future"),
      createEventOuterSlot(10, "future"),
      createEventOuterSlot(11, "future"),
      createEventOuterSlot(12, "future"),
      createEventInnerSlot(
        1,
        "Commencement",
        "Character of the beginning phase."
      ),
      createEventInnerSlot(2, "Apogee", "Peak or zenith of the event."),
      createEventInnerSlot(
        3,
        "Decline/Obstacle",
        "Challenges, obstacles, or decline."
      ),
      createEventInnerSlot(4, "Fall", "Conclusion or end phase."),
      createEventInnerSlot(
        5,
        "The Past",
        "Special character or influence in the past."
      ),
      createEventInnerSlot(
        6,
        "The Present",
        "Special character or influence in the present."
      ),
      createEventInnerSlot(
        7,
        "The Future",
        "Special character or influence to come."
      ),
      {
        slotKey: "inquirer",
        label: "Inquirer",
        order: 200,
        minCards: 1,
        maxCards: 1,
        validationRules: {
          allowedTypes: ["major"]
        },
        manualSelectionRules: {
          allowedTypes: ["major"],
          allowedCardFilenames: [
            "01_the_magician",
            "02_the_high_priestess"
          ]
        },
        drawRules: {
          allowedTypes: ["major"]
        },
        metadata: {
          displayLabel: "Inquirer",
          groupKey: "center",
          note: "The querent's energy in this reading."
        }
      }
    ],
    specialRules: {
      inquirerCard: {
        slotKey: "inquirer",
        sourceSlotKeys: [...EVENT_INNER_SLOT_KEYS],
        cardNumbersByGender: {
          man: 1,
          woman: 2
        }
      }
    }
  }
] as const;

const TAROT_SPREAD_BY_ID = new Map(
  TAROT_SPREADS.map((spread) => [spread.spreadId, spread] as const)
);

function cloneCardConstraint(
  constraint?: TarotSpreadCardConstraint
): TarotSpreadCardConstraint | undefined {
  if (!constraint) {
    return undefined;
  }

  return {
    allowedTypes: constraint.allowedTypes
      ? [...constraint.allowedTypes]
      : undefined,
    requiredRank: constraint.requiredRank,
    allowedCardFilenames: constraint.allowedCardFilenames
      ? [...constraint.allowedCardFilenames]
      : undefined,
    excludedCardFilenames: constraint.excludedCardFilenames
      ? [...constraint.excludedCardFilenames]
      : undefined
  };
}

function cloneSlotDefinition(
  slot: TarotSpreadSlotDefinition
): TarotSpreadSlotDefinition {
  return {
    ...slot,
    validationRules: cloneCardConstraint(slot.validationRules),
    manualSelectionRules: cloneCardConstraint(slot.manualSelectionRules),
    drawRules: cloneCardConstraint(slot.drawRules),
    metadata: slot.metadata ? { ...slot.metadata } : undefined
  };
}

function cloneSpreadDefinition(
  spread: TarotSpreadDefinition
): TarotSpreadDefinition {
  return {
    ...spread,
    contextRequirements: spread.contextRequirements
      ? [...spread.contextRequirements]
      : undefined,
    slots: spread.slots.map(cloneSlotDefinition),
    specialRules: spread.specialRules?.inquirerCard
      ? {
          inquirerCard: {
            slotKey: spread.specialRules.inquirerCard.slotKey,
            sourceSlotKeys: [...spread.specialRules.inquirerCard.sourceSlotKeys],
            cardNumbersByGender: {
              ...spread.specialRules.inquirerCard.cardNumbersByGender
            }
          }
        }
      : undefined
  };
}

function getTarotDeckCardByNumber(cardNumber: number): TarotCard | undefined {
  return TAROT_CARD_BY_NUMBER.get(cardNumber);
}

function getTarotSpreadRuleForValidation(
  slot: TarotSpreadSlotDefinition
): TarotSpreadCardConstraint | undefined {
  return slot.validationRules ?? slot.drawRules ?? slot.manualSelectionRules;
}

function getTarotSpreadRuleForDraw(
  slot: TarotSpreadSlotDefinition
): TarotSpreadCardConstraint | undefined {
  return slot.drawRules ?? slot.validationRules ?? slot.manualSelectionRules;
}

function getTarotMinorRank(
  card: TarotCard
): TarotSpreadMinorRank | undefined {
  if (card.type !== "minor") {
    return undefined;
  }

  const rank = card.tarotCardFilename.split("_")[0] as TarotSpreadMinorRank;
  return TAROT_SPREAD_MINOR_RANKS.includes(rank) ? rank : undefined;
}

function matchesTarotSpreadConstraint(
  card: TarotCard,
  constraint?: TarotSpreadCardConstraint
): boolean {
  if (!constraint) {
    return true;
  }

  if (
    constraint.allowedTypes &&
    !constraint.allowedTypes.includes(card.type)
  ) {
    return false;
  }

  if (
    constraint.allowedCardFilenames &&
    !constraint.allowedCardFilenames.includes(card.tarotCardFilename)
  ) {
    return false;
  }

  if (
    constraint.excludedCardFilenames &&
    constraint.excludedCardFilenames.includes(card.tarotCardFilename)
  ) {
    return false;
  }

  if (constraint.requiredRank) {
    return getTarotMinorRank(card) === constraint.requiredRank;
  }

  return true;
}

function randomIndex(length: number, rng: () => number): number {
  if (length <= 0) {
    throw new Error("Cannot draw from an empty pool.");
  }

  const raw = rng();
  if (!Number.isFinite(raw)) {
    throw new Error("Tarot spread RNG must return a finite number.");
  }

  const normalized = Math.min(Math.max(raw, 0), 1 - Number.EPSILON);
  return Math.floor(normalized * length);
}

function withSpreadCardOrientation(
  card: TarotCard,
  includeInverted: boolean,
  rng: () => number
): TarotCard {
  return {
    ...card,
    isInverted: includeInverted ? rng() < 0.5 : false
  };
}

function resolveTarotSpreadSelectionCard(
  card: TarotSpreadSelectionCard,
  slot: TarotSpreadSlotDefinition,
  tarotCard: TarotCard
): TarotSpreadResolvedSelectionCard {
  return {
    ...card,
    slot,
    card: {
      ...tarotCard,
      isInverted: card.isInverted ?? false
    }
  };
}

function sortResolvedTarotSpreadCards(
  resolvedCards: TarotSpreadResolvedSelectionCard[]
): TarotSpreadResolvedSelectionCard[] {
  return [...resolvedCards].sort((left, right) => {
    if (left.slot.order !== right.slot.order) {
      return left.slot.order - right.slot.order;
    }

    return left.card.number - right.card.number;
  });
}

function validateEventInquirerCard(
  spread: TarotSpreadDefinition,
  resolvedCards: TarotSpreadResolvedSelectionCard[],
  context: TarotSpreadSelectionContext | undefined,
  errors: TarotSpreadValidationIssue[]
): void {
  const inquirerRule = spread.specialRules?.inquirerCard;

  if (!inquirerRule) {
    return;
  }

  if (!context?.inquirerGender) {
    return;
  }

  const inquirerCardNumber =
    inquirerRule.cardNumbersByGender[context.inquirerGender];
  const sourceCards = resolvedCards.filter((card) =>
    inquirerRule.sourceSlotKeys.includes(card.slotKey)
  );
  const inquirerCards = resolvedCards.filter(
    (card) => card.slotKey === inquirerRule.slotKey
  );

  if (inquirerCards.length !== 1) {
    return;
  }

  const sourceContainsGenderCard = sourceCards.some(
    (card) => card.card.number === inquirerCardNumber
  );
  const totalGenderCardCount = [...sourceCards, ...inquirerCards].filter(
    (card) => card.card.number === inquirerCardNumber
  ).length;

  if (totalGenderCardCount !== 1) {
    errors.push({
      code: "INVALID_INQUIRER_CARD",
      slotKey: inquirerRule.slotKey,
      cardNumber: inquirerCardNumber,
      message:
        "Event Reading must contain the gendered inquirer card exactly once across the major arcana band and inquirer slot."
    });
    return;
  }

  if (
    !sourceContainsGenderCard &&
    inquirerCards[0].card.number !== inquirerCardNumber
  ) {
    errors.push({
      code: "INVALID_INQUIRER_CARD",
      slotKey: inquirerRule.slotKey,
      cardNumber: inquirerCards[0].card.number,
      message:
        "When the inquirer card was not drawn in the seven major slots, it must occupy the Inquirer slot."
    });
  }
}

function pickTarotCardFromPool(
  pool: TarotCard[],
  constraint: TarotSpreadCardConstraint | undefined,
  rng: () => number
): TarotCard {
  const candidateIndexes = pool.reduce<number[]>((indexes, card, index) => {
    if (matchesTarotSpreadConstraint(card, constraint)) {
      indexes.push(index);
    }

    return indexes;
  }, []);

  if (candidateIndexes.length === 0) {
    throw new Error("Unable to draw a tarot card that satisfies the spread rule.");
  }

  const pickedIndex = candidateIndexes[randomIndex(candidateIndexes.length, rng)];
  const [pickedCard] = pool.splice(pickedIndex, 1);

  return pickedCard;
}

function buildResolvedDrawnCard(
  slot: TarotSpreadSlotDefinition,
  card: TarotCard,
  includeInverted: boolean,
  rng: () => number
): TarotSpreadResolvedSelectionCard {
  const drawnCard = withSpreadCardOrientation(card, includeInverted, rng);

  return {
    slotKey: slot.slotKey,
    cardNumber: drawnCard.number,
    isInverted: drawnCard.isInverted ?? false,
    slot,
    card: drawnCard
  };
}

function drawDefaultTarotSpread(
  spread: TarotSpreadDefinition,
  includeInverted: boolean,
  rng: () => number
): TarotSpreadResolvedSelectionCard[] {
  const deckPool = [...ARKANNUS];
  const drawnCards: TarotSpreadResolvedSelectionCard[] = [];

  for (const slot of spread.slots.slice().sort((left, right) => left.order - right.order)) {
    const drawRule = getTarotSpreadRuleForDraw(slot);

    for (let index = 0; index < slot.maxCards; index += 1) {
      const card = pickTarotCardFromPool(deckPool, drawRule, rng);
      drawnCards.push(
        buildResolvedDrawnCard(slot, card, includeInverted, rng)
      );
    }
  }

  return drawnCards;
}

function drawEventReadingSpread(
  spread: TarotSpreadDefinition,
  includeInverted: boolean,
  rng: () => number,
  context: TarotSpreadSelectionContext | undefined
): TarotSpreadResolvedSelectionCard[] {
  const inquirerRule = spread.specialRules?.inquirerCard;

  if (!inquirerRule || !context?.inquirerGender) {
    throw new Error(
      "Event Reading draw requires `context.inquirerGender`."
    );
  }

  const slotsByKey = new Map(
    spread.slots.map((slot) => [slot.slotKey, slot] as const)
  );
  const outerPool = ARKANNUS.filter(
    (card) => card.type === "minor" || card.type === "daat+royalship"
  );
  const majorPool = ARKANNUS.filter((card) => card.type === "major");
  const drawnCards: TarotSpreadResolvedSelectionCard[] = [];

  for (const slot of spread.slots
    .filter((candidate) => candidate.metadata?.groupKey === "outer")
    .sort((left, right) => left.order - right.order)) {
    const card = pickTarotCardFromPool(outerPool, getTarotSpreadRuleForDraw(slot), rng);
    drawnCards.push(buildResolvedDrawnCard(slot, card, includeInverted, rng));
  }

  for (const slotKey of inquirerRule.sourceSlotKeys) {
    const slot = slotsByKey.get(slotKey);

    if (!slot) {
      throw new Error(`Missing Event Reading slot definition for ${slotKey}.`);
    }

    const card = pickTarotCardFromPool(majorPool, getTarotSpreadRuleForDraw(slot), rng);
    drawnCards.push(buildResolvedDrawnCard(slot, card, includeInverted, rng));
  }

  const genderedInquirerCardNumber =
    inquirerRule.cardNumbersByGender[context.inquirerGender];
  const sourceContainsGenderedCard = drawnCards.some(
    (card) =>
      inquirerRule.sourceSlotKeys.includes(card.slotKey) &&
      card.card.number === genderedInquirerCardNumber
  );
  const inquirerSlot = slotsByKey.get(inquirerRule.slotKey);

  if (!inquirerSlot) {
    throw new Error(
      `Missing Event Reading slot definition for ${inquirerRule.slotKey}.`
    );
  }

  if (!sourceContainsGenderedCard) {
    const genderedCardIndex = majorPool.findIndex(
      (card) => card.number === genderedInquirerCardNumber
    );

    if (genderedCardIndex < 0) {
      throw new Error(
        "Unable to assign the Event Reading inquirer card from the remaining major arcana."
      );
    }

    const [genderedCard] = majorPool.splice(genderedCardIndex, 1);
    drawnCards.push(
      buildResolvedDrawnCard(inquirerSlot, genderedCard, includeInverted, rng)
    );
  } else {
    const replacement = pickTarotCardFromPool(
      majorPool,
      getTarotSpreadRuleForDraw(inquirerSlot),
      rng
    );
    drawnCards.push(
      buildResolvedDrawnCard(inquirerSlot, replacement, includeInverted, rng)
    );
  }

  return drawnCards;
}

export function listTarotSpreads(): TarotSpreadDefinition[] {
  return TAROT_SPREADS.map(cloneSpreadDefinition);
}

export function getTarotSpread(
  spreadId: TarotSpreadId
): TarotSpreadDefinition | undefined {
  const spread = TAROT_SPREAD_BY_ID.get(spreadId);
  return spread ? cloneSpreadDefinition(spread) : undefined;
}

export function validateTarotSpreadSelection(
  input: TarotSpreadValidationInput
): TarotSpreadValidationResult {
  const spread = TAROT_SPREAD_BY_ID.get(input.spreadId);
  const errors: TarotSpreadValidationIssue[] = [];

  if (!spread) {
    return {
      ok: false,
      isComplete: false,
      errors: [
        {
          code: "UNKNOWN_SPREAD",
          message: `Unknown tarot spread: ${input.spreadId}.`
        }
      ],
      resolvedCards: []
    };
  }

  const slotsByKey = new Map(
    spread.slots.map((slot) => [slot.slotKey, slot] as const)
  );
  const seenCardNumbers = new Set<number>();
  const resolvedCards: TarotSpreadResolvedSelectionCard[] = [];

  for (const selectedCard of input.cards) {
    const slot = slotsByKey.get(selectedCard.slotKey);

    if (!slot) {
      errors.push({
        code: "UNKNOWN_SLOT",
        slotKey: selectedCard.slotKey,
        message: `Unknown slot for ${spread.label}: ${selectedCard.slotKey}.`
      });
      continue;
    }

    const tarotCard = getTarotDeckCardByNumber(selectedCard.cardNumber);

    if (!tarotCard) {
      errors.push({
        code: "CARD_NOT_FOUND",
        slotKey: selectedCard.slotKey,
        cardNumber: selectedCard.cardNumber,
        message: `Unknown tarot card number: ${selectedCard.cardNumber}.`
      });
      continue;
    }

    if (seenCardNumbers.has(tarotCard.number)) {
      errors.push({
        code: "DUPLICATE_CARD",
        slotKey: selectedCard.slotKey,
        cardNumber: tarotCard.number,
        message: `Tarot card ${tarotCard.number} is duplicated across the spread.`
      });
      continue;
    }

    seenCardNumbers.add(tarotCard.number);
    resolvedCards.push(
      resolveTarotSpreadSelectionCard(selectedCard, slot, tarotCard)
    );
  }

  let isComplete = true;

  for (const slot of spread.slots) {
    const slotCards = resolvedCards.filter(
      (selectedCard) => selectedCard.slotKey === slot.slotKey
    );

    if (slotCards.length < slot.minCards) {
      isComplete = false;
      if (!input.allowPartial) {
        errors.push({
          code: "MISSING_REQUIRED_CARDS",
          slotKey: slot.slotKey,
          message: `${spread.label} requires ${slot.minCards} card(s) for ${slot.label}.`
        });
      }
    }

    if (slotCards.length > slot.maxCards) {
      isComplete = false;
      errors.push({
        code: "TOO_MANY_CARDS",
        slotKey: slot.slotKey,
        message: `${spread.label} allows at most ${slot.maxCards} card(s) for ${slot.label}.`
      });
    }

    const validationRule = getTarotSpreadRuleForValidation(slot);

    for (const slotCard of slotCards) {
      if (validationRule?.allowedTypes && !validationRule.allowedTypes.includes(slotCard.card.type)) {
        errors.push({
          code: "INVALID_CARD_TYPE",
          slotKey: slot.slotKey,
          cardNumber: slotCard.card.number,
          message: `${slot.label} does not accept ${slotCard.card.type} cards.`
        });
      }

      if (
        validationRule?.requiredRank &&
        getTarotMinorRank(slotCard.card) !== validationRule.requiredRank
      ) {
        errors.push({
          code: "INVALID_CARD_RANK",
          slotKey: slot.slotKey,
          cardNumber: slotCard.card.number,
          message: `${slot.label} requires a ${validationRule.requiredRank} minor arcana card.`
        });
      }

      if (
        validationRule?.allowedCardFilenames &&
        !validationRule.allowedCardFilenames.includes(slotCard.card.tarotCardFilename)
      ) {
        errors.push({
          code: "DISALLOWED_CARD",
          slotKey: slot.slotKey,
          cardNumber: slotCard.card.number,
          message: `${slotCard.card.tarotCard} is not allowed in ${slot.label}.`
        });
      }

      if (
        validationRule?.excludedCardFilenames &&
        validationRule.excludedCardFilenames.includes(slotCard.card.tarotCardFilename)
      ) {
        errors.push({
          code: "DISALLOWED_CARD",
          slotKey: slot.slotKey,
          cardNumber: slotCard.card.number,
          message: `${slotCard.card.tarotCard} is excluded from ${slot.label}.`
        });
      }
    }
  }

  if (
    spread.contextRequirements?.includes("inquirerGender") &&
    !input.context?.inquirerGender
  ) {
    isComplete = false;
    errors.push({
      code: "MISSING_CONTEXT",
      message: `${spread.label} requires \`context.inquirerGender\`.`
    });
  }

  validateEventInquirerCard(spread, resolvedCards, input.context, errors);

  const sortedResolvedCards = sortResolvedTarotSpreadCards(resolvedCards);

  return {
    ok: errors.length === 0,
    isComplete,
    spread: cloneSpreadDefinition(spread),
    resolvedCards: sortedResolvedCards,
    errors
  };
}

export function drawTarotSpread(
  options: DrawTarotSpreadOptions
): TarotSpreadDrawResult {
  const spread = TAROT_SPREAD_BY_ID.get(options.spreadId);

  if (!spread) {
    throw new Error(`Unknown tarot spread: ${options.spreadId}.`);
  }

  const rng = options.rng ?? Math.random;
  const includeInverted = options.includeInverted ?? false;
  const drawnCards =
    spread.spreadId === "event-reading"
      ? drawEventReadingSpread(spread, includeInverted, rng, options.context)
      : drawDefaultTarotSpread(spread, includeInverted, rng);
  const validation = validateTarotSpreadSelection({
    spreadId: spread.spreadId,
    cards: drawnCards.map((card) => ({
      slotKey: card.slotKey,
      cardNumber: card.cardNumber,
      isInverted: card.isInverted
    })),
    context: options.context
  });

  if (!validation.ok) {
    throw new Error(
      `Generated an invalid tarot spread selection for ${spread.label}: ${validation.errors
        .map((error) => error.message)
        .join(" ")}`
    );
  }

  return {
    spread: cloneSpreadDefinition(spread),
    deckId: options.deckId ?? "rider-waite",
    context: options.context,
    cards: sortResolvedTarotSpreadCards(drawnCards)
  };
}
