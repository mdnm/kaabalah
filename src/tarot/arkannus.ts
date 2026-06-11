import {
  getCanonicalTree,
  id,
  NumerologyTypes,
  parseId,
  TarotTypes,
  type NodeId,
} from "../core";
import {
  DEFAULT_TAROT_TREE_ID,
  RAW_ARKANNUS,
  type TarotCard,
  type TarotTreeId,
} from "./data";

const TAROT_TREE_PARTS: Partial<Record<TarotTreeId, readonly ["tarot"]>> = {
  kaabalah: ["tarot"]
};

export function getTarotTreeWorkspace(treeId: TarotTreeId = DEFAULT_TAROT_TREE_ID) {
  const parts = TAROT_TREE_PARTS[treeId];

  if (!parts) {
    return undefined;
  }

  return getCanonicalTree({
    system: treeId,
    parts: [...parts]
  });
}

export function getDirectTarotCardNumber(
  tarotArkAnnuId: NodeId<TarotTypes.TAROT_ARK_ANNU>,
  treeId: TarotTreeId = DEFAULT_TAROT_TREE_ID
): number | undefined {
  const tree = getTarotTreeWorkspace(treeId);

  if (!tree) {
    return undefined;
  }

  const match = tree.getCorrespondences(tarotArkAnnuId, {
    type: NumerologyTypes.NUMBER,
    depth: 1,
    limit: 1
  })[0];

  if (!match) {
    return undefined;
  }

  return Number.parseInt(parseId(match.node.id), 10);
}

function buildDefaultArkannus(cards: TarotCard[]): TarotCard[] {
  const tree = getTarotTreeWorkspace(DEFAULT_TAROT_TREE_ID);
  const resolveNumber = (tarotCardName: string) => {
    if (!tree) {
      return undefined;
    }

    const match = tree.getCorrespondences(
      id(TarotTypes.TAROT_ARK_ANNU, tarotCardName),
      {
        type: NumerologyTypes.NUMBER,
        depth: 1,
        limit: 1
      }
    )[0];

    if (!match) {
      return undefined;
    }

    return Number.parseInt(parseId(match.node.id), 10);
  };

  return [...cards]
    .map((card) => ({
      ...card,
      number: resolveNumber(card.tarotCard) ?? card.number
    }))
    .sort((left, right) => {
      if (left.number !== right.number) {
        return left.number - right.number;
      }

      return left.tarotCard.localeCompare(right.tarotCard);
    });
}

export const ARKANNUS: TarotCard[] = buildDefaultArkannus(RAW_ARKANNUS);
