import { expect, test } from 'vitest';
import { getIChingReading } from '../iching';
import { buildReadingWeights, buildThreads, projectChart, rankedSpheres, resolveCard, type ReadingCard } from './reading';

// Regression fixture: Judgment, Queen of Pentacles, Eight of Swords; hexagram 52
// with lines 1 and 4 moving, becoming 30; Mercury in Cancer.
const cards = [resolveCard(20, 'conscious'), resolveCard(66, 'unconscious'), resolveCard(57, 'subconscious')].filter(
  (card): card is ReadingCard => card !== null,
);
const iching = getIChingReading('687687');
const natal = {
  planets: { sun: 'Gemini', moon: 'Gemini', mercury: 'Cancer', venus: 'Taurus', mars: 'Cancer', jupiter: 'Aquarius', saturn: 'Scorpio' },
  ascendant: 'Virgo',
};

test('the cast is 52 becoming 30', () => {
  expect(iching.cast.hexagram.number).toBe(52);
  expect(iching.transformed?.hexagram.number).toBe(30);
});

test('weights match the regression fixture', () => {
  const weights = buildReadingWeights({ cards, iching, natal });
  expect(rankedSpheres(weights).map((entry) => [entry.id, entry.count])).toEqual([
    ['sphere:Hod', 7],
    ['sphere:Yesod', 3],
    ['sphere:Malkuth', 2],
  ]);
  expect(weights.paths.get('path:20')).toBe(3);
  expect(weights.paths.get('path:21')).toBe(2);
  expect(weights.top).toBe('sphere:Hod');
  expect(weights.spheres.has('sphere:Daath')).toBe(false);
});

test('without a chart the pip planet adds nothing', () => {
  const weights = buildReadingWeights({ cards, iching, natal: null });
  expect(weights.spheres.get('sphere:Hod')?.count).toBe(6);
});

test('threads: the top sphere, Saturn, Taurus', () => {
  const input = { cards, iching, natal };
  const weights = buildReadingWeights(input);
  const sky = { planets: { venus: 'Taurus', mercury: 'Scorpio' }, ascendant: null };
  const threads = buildThreads({ ...input, sky, birthday: { month: 6, day: 18 } }, weights);
  expect(threads.map((thread) => thread.id)).toEqual(['top', 'conscious', 'unconscious', 'subconscious']);
  expect(threads[3].rows.map((row) => row.hit.key)).toEqual(['pipIsPlanet', 'skyPlanet']);
  expect(threads[0].rows.map((row) => [row.hit.key, row.count])).toEqual([
    ['majorFrom', 1],
    ['pipHome', 1],
    ['trigramFrom', 2],
    ['trigramFrom', 2],
    ['pipPlanet', 1],
  ]);
  expect(threads[1].title).toEqual({ kind: 'planet', value: 'saturn' });
  expect(threads[2].rows.map((row) => row.hit.key)).toEqual(['courtSign', 'natalHas', 'skyIn']);
});

test('with no birth data the moment of the question still answers the cards', () => {
  const input = { cards, iching, natal: null };
  const sky = { planets: { saturn: 'Aries', venus: 'Taurus' }, ascendant: 'Taurus' };
  const threads = buildThreads({ ...input, sky, birthday: null }, buildReadingWeights(input));
  expect(threads.map((thread) => thread.id)).toEqual(['top', 'conscious', 'unconscious']);
  expect(threads[1].rows.map((row) => row.hit.key)).toEqual(['majorPlanet', 'skyPlanet']);
  expect(threads[2].rows[1].hit).toMatchObject({ key: 'skyIn', planets: ['venus'], ascendant: true });
});


test('all 78 canonical cards resolve, with courts excluded and pip ranks skipping Daath', () => {
  const all = Array.from({ length: 78 }, (_, index) => resolveCard(index + 1, null)!);
  expect(all.every(Boolean)).toBe(true);
  expect(all.filter((card) => card.kind === 'major')).toHaveLength(22);
  expect(all.filter((card) => card.kind === 'court')).toHaveLength(16);
  const pips = all.filter((card) => card.kind === 'minor');
  expect(pips).toHaveLength(40);
  expect(pips.every((card) => card.sphere !== 'sphere:Daath' && card.rank! >= 1 && card.rank! <= 10)).toBe(true);
  // Every court but the one that carries Scorpio (the Queen of Cups) leaves the Tree unlit.
  const weights = buildReadingWeights({ cards: all.filter((card) => card.kind === 'court' && card.sign !== 'Scorpio'), iching: null, natal });
  expect(weights.spheres.size).toBe(0);
  expect(weights.paths.size).toBe(0);
  expect(weights.top).toBeNull();
  expect(resolveCard(0, null)).toBeNull();
  expect(resolveCard(79, null)).toBeNull();
});

test('a tied sphere higher on the Tree wins, independent of input order', () => {
  const all = Array.from({ length: 78 }, (_, index) => resolveCard(index + 1, null)!);
  const kether = all.find((card) => card.kind === 'minor' && card.sphere === 'sphere:Kether')!;
  const malkuth = all.find((card) => card.kind === 'minor' && card.sphere === 'sphere:Malkuth')!;
  const weights = buildReadingWeights({ cards: [malkuth, kether], iching: null, natal: null });
  expect(weights.top).toBe('sphere:Kether');
  expect(rankedSpheres(weights).map((row) => row.id)).toEqual(['sphere:Kether', 'sphere:Malkuth']);
});

test('a static double trigram counts both gates without a transformed duplicate', () => {
  const cast = getIChingReading('887887');
  expect(cast.cast.hexagram.number).toBe(52);
  expect(cast.transformed).toBeNull();
  const weights = buildReadingWeights({ cards: [], iching: cast, natal: null });
  expect([...weights.paths.values()]).toEqual([2]);
  expect([...weights.spheres.values()].map((row) => row.count)).toEqual([2, 2]);
});

test('chart projection keeps only ten planets and five major aspects, with no invented houses', () => {
  const chart = {
    planets: {
      Sun: { zodiacPosition: { sign: 'Gemini', house: 2 } },
      Mercury: { zodiacPosition: { sign: 'Cancer', house: 3 } },
      Chiron: { zodiacPosition: { sign: 'Aries', house: 1 } },
    },
    houses: { ascendant: { sign: 'Taurus' } },
    aspects: [
      { planetA: 'Sun', planetB: 'Mercury', aspect: 'conjunction' },
      { planetA: 'Sun', planetB: 'Chiron', aspect: 'square' },
      { planetA: 'Sun', planetB: 'Mercury', aspect: 'quintile' },
    ],
  };
  expect(projectChart(chart, { houses: false })).toEqual({
    planets: { sun: 'Gemini', mercury: 'Cancer' }, ascendant: null,
    aspects: [{ a: 'sun', b: 'mercury', aspect: 'conjunction' }],
  });
  expect(projectChart(chart, { houses: true })).toMatchObject({
    ascendant: 'Taurus', houses: { sun: 2, mercury: 3 },
  });
});

test('day chart planet connections and aspect details add no Tree weight', () => {
  const input = { cards, iching, natal: null };
  const weights = buildReadingWeights(input);
  const before = [...weights.spheres].map(([sphere, entry]) => [sphere, entry.count]);
  const day = { planets: { saturn: 'Pisces', mercury: 'Scorpio' }, ascendant: null,
    aspects: [{ a: 'mercury', b: 'saturn', aspect: 'trine' }] };
  const threads = buildThreads({ ...input, sky: null, day, birthday: null }, weights);
  expect(threads.find((thread) => thread.id === 'conscious')?.rows.some((row) => row.hit.key === 'dayPlanet')).toBe(true);
  expect(threads.flatMap((thread) => thread.rows).filter((row) => row.hit.key === 'aspects').every((row) => row.detail)).toBe(true);
  expect([...weights.spheres].map(([sphere, entry]) => [sphere, entry.count])).toEqual(before);
});


test('a conscious element can be answered by horary and day charts without birth data', () => {
  const conscious = Array.from({ length: 22 }, (_, index) => resolveCard(index + 1, 'conscious')!)
    .find((card) => card.tag?.type === 'element' && card.tag.value === 'Fire')!;
  expect(conscious).toBeDefined();
  const input = { cards: [conscious], iching: null, natal: null };
  const sky = { planets: { sun: 'Aries' }, ascendant: null };
  const day = { planets: { sun: 'Leo' }, ascendant: null };
  const threads = buildThreads({ ...input, sky, day, birthday: null }, buildReadingWeights(input));
  const rows = threads.find((thread) => thread.id === 'conscious')!.rows;
  expect(rows.map((row) => row.hit.key)).toEqual(['majorElement', 'skyInElement', 'dayInElement']);
  expect(rows[1].hit.placements).toEqual([{ planet: 'sun', sign: 'Aries' }]);
  const repeated = buildThreads({ ...input, sky, day: sky, birthday: null }, buildReadingWeights(input));
  expect(repeated.find((thread) => thread.id === 'conscious')!.rows.map((row) => row.hit.key))
    .toEqual(['majorElement', 'skyInElement']);
});


test('projection retains actual cusp signs only when the chart has houses', () => {
  const chart = { planets: {}, houses: {
    ascendant: { sign: 'Taurus' },
    houses: [{ sign: 'Taurus' }, { sign: 'Gemini' }, { sign: 'Cancer' }],
  } };
  expect(projectChart(chart, { houses: true }).houseSigns).toEqual({ 1: 'Taurus', 2: 'Gemini', 3: 'Cancer' });
  expect(projectChart(chart, { houses: false }).houseSigns).toBeUndefined();
  expect(projectChart(chart, { houses: false }).ascendant).toBeNull();
});


test('the day chart never contributes a rising, even for an unprojected caller input', () => {
  const court = resolveCard(66, 'unconscious')!;
  const input = { cards: [court], iching: null, natal: null };
  const threads = buildThreads({ ...input, sky: null, day: { planets: {}, ascendant: court.sign! }, birthday: null },
    buildReadingWeights(input));
  expect(threads).toEqual([]);
});

test('every actual matching house is context, with selected houses prioritized independently of Tree weight', () => {
  const chariot = resolveCard(7, 'conscious')!;
  const pip = resolveCard(57, 'subconscious')!;
  expect(chariot.tag).toEqual({ type: 'sign', value: 'Gemini' });
  const natal = { planets: { mercury: 'Cancer' }, ascendant: 'Aries',
    houses: { mercury: 4 }, houseSigns: { 2: 'Gemini', 10: 'Gemini' },
    aspects: [{ a: 'mercury', b: 'saturn', aspect: 'trine' }] };
  const sky = { planets: { mercury: 'Scorpio' }, ascendant: null, houseSigns: { 9: 'Gemini' } };
  const day = { planets: { mercury: 'Sagittarius' }, ascendant: 'Gemini', houseSigns: { 2: 'Gemini' } };
  const input = { cards: [chariot, pip], iching: null, natal, selectedHouses: [2] };
  const weights = buildReadingWeights(input);
  const before = JSON.stringify([...weights.spheres]);
  const rows = buildThreads({ ...input, sky, day, birthday: null }, weights)
    .find((thread) => thread.id === 'conscious')!.rows;
  const houses = rows.filter((row) => row.hit.key === 'signHouse');
  expect(houses.map((row) => [row.hit.system, row.hit.house, row.relevance?.weight])).toEqual([
    ['chart', 2, 2], ['chart', 10, 1], ['sky', 9, 1],
  ]);
  expect(houses[0].relevance?.selectedForQuestion).toBe(true);
  const reordered = buildThreads({ ...input, selectedHouses: [10], sky, day, birthday: null }, weights)
    .find((thread) => thread.id === 'conscious')!.rows.filter((row) => row.hit.key === 'signHouse');
  expect(reordered.map((row) => [row.hit.house, row.relevance?.weight])).toEqual([[10, 2], [2, 1], [9, 1]]);
  expect(houses.every((row) => row.detail && row.count === 1 && row.relevance?.requiresHumanReview)).toBe(true);
  expect(houses.some((row) => row.hit.system === 'day')).toBe(false);
  expect(rows.find((row) => row.hit.key === 'rulerCard')?.hit).toMatchObject({ planet: 'mercury', sphere: 'sphere:Hod', card: pip });
  expect(rows.filter((row) => row.hit.key === 'rulerPlacement').map((row) => [row.hit.system, row.hit.sign, row.hit.viaSign])).toEqual([
    ['chart', 'Cancer', 'Gemini'], ['sky', 'Scorpio', 'Gemini'], ['day', 'Sagittarius', 'Gemini'],
  ]);
  expect(rows.find((row) => row.hit.key === 'rulerPlacement' && row.hit.system === 'chart')?.hit.house).toBe(4);
  expect(rows.find((row) => row.hit.key === 'rulerPlacement' && row.hit.system === 'chart')?.hit.aspects).toEqual([{ other: 'saturn', aspect: 'trine' }]);
  expect(rows.find((row) => row.hit.key === 'rulerPlacement' && row.hit.system === 'day')?.hit.house).toBeUndefined();
  expect(JSON.stringify([...weights.spheres])).toBe(before);
  expect(buildReadingWeights({ ...input, selectedHouses: [] })).toEqual(weights);
});

test('ruler and card context remains available without a placement or a matching house', () => {
  const cards = [resolveCard(7, 'conscious')!, resolveCard(57, 'subconscious')!];
  const input = { cards, iching: null, natal: null };
  const rows = buildThreads({ ...input, sky: null, birthday: null }, buildReadingWeights(input))
    .find((thread) => thread.id === 'conscious')!.rows;
  expect(rows.map((row) => row.hit.key)).toEqual(['majorSign', 'signRuler', 'rulerCard']);
  expect(rows[1].hit).toMatchObject({ sign: 'Gemini', planet: 'mercury', rulership: 'traditional' });
  expect(rows.slice(1).every((row) => row.detail && row.relevance?.requiresHumanReview && row.relevance.weight === 1)).toBe(true);
});

test('house matches use cusp signs and ignore invalid question-house selections', () => {
  const input = { cards: [resolveCard(7, 'conscious')!], iching: null,
    natal: { planets: {}, ascendant: null, houseSigns: { 2: 'Gemini', 3: 'Cancer', 0: 'Gemini', 13: 'Gemini' } },
    selectedHouses: [0, 13, 2.5, NaN] };
  const rows = buildThreads({ ...input, sky: null, birthday: null }, buildReadingWeights(input))
    .find((thread) => thread.id === 'conscious')!.rows.filter((row) => row.hit.key === 'signHouse');
  expect(rows.map((row) => row.hit.house)).toEqual([2]);
  expect(rows[0].relevance).toEqual({ weight: 1, selectedForQuestion: false, requiresHumanReview: true });
});

test('Daath lights only through Scorpio: Temperance or the Queen of Cups, and a birth placement answering them', () => {
  const temperance = resolveCard(14, 'conscious')!;
  const queenOfCups = resolveCard(38, 'unconscious')!;
  const kingOfWands = resolveCard(23, 'unconscious')!;
  expect(temperance.tag).toEqual({ type: 'sign', value: 'Scorpio' });
  expect(queenOfCups.sign).toBe('Scorpio');
  expect(kingOfWands.kind).toBe('court');
  const daath = (reading: Parameters<typeof buildReadingWeights>[0]) => buildReadingWeights(reading).spheres.get('sphere:Daath');

  // Another court, even with Scorpio in the birth chart: nothing.
  expect(daath({ cards: [kingOfWands], iching: null, natal })).toBeUndefined();

  // The card alone is one link; a birth placement in Scorpio is a second.
  expect(daath({ cards: [queenOfCups], iching: null, natal: null })?.hits.map((hit) => hit.key)).toEqual(['courtSign']);
  expect(daath({ cards: [queenOfCups], iching: null, natal })?.hits.map((hit) => hit.key)).toEqual(['courtSign', 'natalHas']);
  expect(daath({ cards: [temperance], iching: null, natal })?.hits).toMatchObject([
    { key: 'majorSign', sign: 'Scorpio', path: temperance.path!.number },
    { key: 'natalInSign', sign: 'Scorpio', planets: ['saturn'] },
  ]);
  expect(daath({ cards: [temperance], iching: null, natal: { planets: { sun: 'Leo' }, ascendant: 'Scorpio' } })?.count).toBe(1);
  expect(daath({ cards: [queenOfCups], iching: null, natal: { planets: { sun: 'Leo' }, ascendant: 'Scorpio' } })?.count).toBe(2);

  // Both cards with a Scorpio placement: four links, and Temperance still walks its own path.
  const both = buildReadingWeights({ cards: [temperance, queenOfCups], iching: null, natal });
  expect(both.spheres.get('sphere:Daath')?.count).toBe(4);
  expect(both.spheres.get('sphere:Tiphareth')?.count).toBe(1);
  expect(both.top).toBe('sphere:Daath');
});
