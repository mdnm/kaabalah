# Tarot Numbering Migration

Tarot numbering is tree-scoped.

- The current canonical default is the `kaabalah` tree.
- The library now resolves card numbers from the direct `tarotArkAnnu ↔ number` correspondence in that tree.
- Downstream apps should use `getTarotCardProfile()`, `getTarotCardNumber()`, or `getTarotCardByNumber()` instead of treating raw `ARKANNUS` entries as the numbering source of truth.

What changed observably in the kaabalah-default numbering:

- `Ten of Swords` moved from `64` to `55`
- `Ace of Swords` moved from `55` to `64`
- `Ten of Pentacles` is `69`
- `Ace of Pentacles` moved from `69` to `78`
- minor suit numbering now follows `Ten → Nine → ... → Two → Ace`

Recommended downstream update path:

1. Stop reading `ARKANNUS[i].number` directly in UI code.
2. Resolve the card profile from canonical identifiers such as `tarotArkAnnuId`, `tarotCardName`, or `tarotCardFilename`.
3. Render the number from `getTarotCardProfile(...).tarotCardNumber` or from `getTarotCardNumber(...)`.
4. Use `getTarotCardByNumber(number)` for reverse lookups in the kaabalah-default tree.

Future trees:

- `listTarotTrees()` already exposes the tree IDs the library knows about.
- Only `kaabalah` has tarot numbering wired today.
- Additional trees can be added later by teaching their canonical tarot workspace how to expose direct `tarotArkAnnu ↔ number` correspondences.
