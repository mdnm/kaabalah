import { describe, expect, it } from 'vitest';
import { TreeOfLife } from './tree-of-life';

describe('TreeOfLife', () => {
  it('should add nodes and links, retrieving relations correctly', () => {
    const treeOfLife = new TreeOfLife();

    treeOfLife.addSphere("Kether", { hebrewName: "Keter", englishName: "Crown", number: 1 });
    treeOfLife.addSphere("Chokmah", { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 });

    const path11 = treeOfLife.addPath("Kether", "Chokmah", 1);

    expect(treeOfLife.related("Kether")).toEqual([
      { id: "Kether", type: "sphere", data: { hebrewName: "Keter", englishName: "Crown", number: 1 } },
      { id: "num:1", type: "number" },
      { id: path11, type: "path", data: { numbers: [1, 11] } },
    ]);
    expect(treeOfLife.related("Chokmah")).toEqual([
      { id: "Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 } },
      { id: "num:2", type: "number" },
      { id: path11, type: "path", data: { numbers: [1, 11] } },
    ]);
    expect(treeOfLife.related(path11)).toEqual([
      { id: path11, type: "path", data: { numbers: [1, 11] } },
      { id: "Kether", type: "sphere", data: { hebrewName: "Keter", englishName: "Crown", number: 1 } },
      { id: "Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 } },
      { id: "num:1", type: "number" },
      { id: "num:11", type: "number" },
    ]);
  });

  it('should throw an error when trying to link unknown nodes', () => {
    const treeOfLife = new TreeOfLife();

    expect(() => treeOfLife.addPath("Kether", "Unknown", 1)).toThrow();
  });

  it('should correctly correspond nodes', () => {
    const treeOfLife = new TreeOfLife();

    treeOfLife.addSphere("Chokmah", { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 });
    treeOfLife.addSphere("Binah", { hebrewName: "Binah", englishName: "Understanding", number: 3 });

    const path14 = treeOfLife.addPath("Chokmah", "Binah", 4);

    treeOfLife.correspond(path14, "Aleph", "hebrewLetter");
    treeOfLife.correspond(path14, "A", "latinLetter");

    treeOfLife.correspond(path14, "Fire", "element");

    treeOfLife.correspond(path14, "Jupiter", "planet");

    const theEmperor = treeOfLife.correspond(path14, "The Emperor", "majorArcana");

    expect(treeOfLife.related(path14)).toEqual([
      { id: path14, type: "path", data: { numbers: [4, 14] } },
      { id: "Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 } },
      { id: "Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding", number: 3 } },
      { id: "num:4", type: "number" },
      { id: "num:14", type: "number" },
      { id: "Aleph", type: "hebrewLetter" },
      { id: "A", type: "latinLetter" },
      { id: "Fire", type: "element" },
      { id: "Jupiter", type: "planet" },
      { id: "The Emperor", type: "majorArcana" },
    ]);
 
    expect(treeOfLife.relatedTypes(theEmperor)).toHaveLength(1);
    expect(treeOfLife.walk(theEmperor, 2, "element")).toEqual([
      { id: "Fire", type: "element" },
    ]);
  });

  it('should correctly remove nodes', () => {
    const treeOfLife = new TreeOfLife();

    treeOfLife.addSphere("Chokmah", { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 });
    treeOfLife.addSphere("Binah", { hebrewName: "Binah", englishName: "Understanding", number: 3 });

    const path14 = treeOfLife.addPath("Chokmah", "Binah", 4);

    treeOfLife.removeNode("Chokmah");

    expect(treeOfLife.related("Chokmah")).toEqual([]);
    expect(treeOfLife.related("Binah")).toEqual([
      { id: "Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding", number: 3 } },
      { id: "num:3", type: "number" },
      { id: path14, type: "path", data: { numbers: [4, 14] } },
    ]);
    expect(treeOfLife.related(path14)).toEqual([
      { id: path14, type: "path", data: { numbers: [4, 14] } },
      { id: "Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding", number: 3 } },
      { id: "num:4", type: "number" },
      { id: "num:14", type: "number" },
    ]);
  });
});