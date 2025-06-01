import { describe, expect, it } from 'vitest';
import { TreeOfLife } from './tree-of-life';

describe('TreeOfLife', () => {
  it('should add nodes and links, retrieving relations correctly', () => {
    const treeOfLife = new TreeOfLife();

    treeOfLife.addSphere("Kether", { hebrewName: "Keter", englishName: "Crown", number: 1 });
    treeOfLife.addSphere("Chokmah", { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 });

    const path11 = treeOfLife.addPath("sphere:Kether", "sphere:Chokmah", 1);

    expect(treeOfLife.related("sphere:Kether")).toEqual([
      { id: "sphere:Kether", type: "sphere", data: { hebrewName: "Keter", englishName: "Crown", number: 1 } },
      { id: "num:1", type: "number" },
      { id: path11, type: "path", data: { numbers: [1, 11] } },
    ]);
    expect(treeOfLife.related("sphere:Chokmah")).toEqual([
      { id: "sphere:Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 } },
      { id: "num:2", type: "number" },
      { id: path11, type: "path", data: { numbers: [1, 11] } },
    ]);
    expect(treeOfLife.related(path11)).toEqual([
      { id: path11, type: "path", data: { numbers: [1, 11] } },
      { id: "sphere:Kether", type: "sphere", data: { hebrewName: "Keter", englishName: "Crown", number: 1 } },
      { id: "sphere:Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 } },
      { id: "num:1", type: "number" },
      { id: "num:11", type: "number" },
    ]);
  });

  it('should throw an error when trying to link unknown nodes', () => {
    const treeOfLife = new TreeOfLife();

    expect(() => treeOfLife.addPath("sphere:Kether", "sphere:Unknown", 1)).toThrow();
  });

  it('should correctly correspond nodes', () => {
    const treeOfLife = new TreeOfLife();

    treeOfLife.addSphere("Chokmah", { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 });
    treeOfLife.addSphere("Binah", { hebrewName: "Binah", englishName: "Understanding", number: 3 });

    const path14 = treeOfLife.addPath("sphere:Chokmah", "sphere:Binah", 4);

    treeOfLife.correspond(path14, "letter:Aleph", "hebrewLetter");
    treeOfLife.correspond(path14, "letter:A", "latinLetter");

    treeOfLife.correspond(path14, "Fire", "element");

    treeOfLife.correspond(path14, "Jupiter", "planet");

    const theEmperor = treeOfLife.correspond(path14, "The Emperor", "majorArcana");

    expect(treeOfLife.related(path14)).toEqual([
      { id: path14, type: "path", data: { numbers: [4, 14] } },
      { id: "sphere:Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom", number: 2 } },
      { id: "sphere:Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding", number: 3 } },
      { id: "num:4", type: "number" },
      { id: "num:14", type: "number" },
      { id: "letter:Aleph", type: "hebrewLetter" },
      { id: "letter:A", type: "latinLetter" },
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

    const path14 = treeOfLife.addPath("sphere:Chokmah", "sphere:Binah", 4);

    treeOfLife.removeNode("sphere:Chokmah");

    expect(treeOfLife.related("sphere:Chokmah")).toEqual([]);
    expect(treeOfLife.related("sphere:Binah")).toEqual([
      { id: "sphere:Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding", number: 3 } },
      { id: "num:3", type: "number" },
      { id: path14, type: "path", data: { numbers: [4, 14] } },
    ]);
    expect(treeOfLife.related(path14)).toEqual([
      { id: path14, type: "path", data: { numbers: [4, 14] } },
      { id: "sphere:Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding", number: 3 } },
      { id: "num:4", type: "number" },
      { id: "num:14", type: "number" },
    ]);
  });
});