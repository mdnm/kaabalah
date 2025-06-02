import { describe, expect, it } from 'vitest';
import { TreeOfLife } from './tree-of-life';

describe('TreeOfLife', () => {
  it('should add nodes and links, retrieving relations correctly', () => {
    const treeOfLife = new TreeOfLife();

    treeOfLife.addSphere("Kether", { hebrewName: "Kether", englishName: "Crown" }, 1);
    treeOfLife.addSphere("Chokmah", { hebrewName: "Chokmah", englishName: "Wisdom" }, 2);

    const path11 = treeOfLife.addPath("Kether", "Chokmah", 1);

    expect(treeOfLife.related("Kether")).toEqual([
      { id: "Kether", type: "sphere", data: { hebrewName: "Kether", englishName: "Crown" } },
      { id: "num:1", type: "number" },
      { id: path11, type: "path" },
    ]);
    expect(treeOfLife.related("Chokmah")).toEqual([
      { id: "Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom" } },
      { id: "num:2", type: "number" },
      { id: path11, type: "path" },
    ]);
    expect(treeOfLife.related(path11)).toEqual([
      { id: path11, type: "path" },
      { id: "Kether", type: "sphere", data: { hebrewName: "Kether", englishName: "Crown" } },
      { id: "Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom" } },
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

    treeOfLife.addSphere("Chokmah", { hebrewName: "Chokmah", englishName: "Wisdom" }, 2);
    treeOfLife.addSphere("Binah", { hebrewName: "Binah", englishName: "Understanding" }, 3);

    const path14 = treeOfLife.addPath("Chokmah", "Binah", 4);

    treeOfLife.correspond(path14, "letter:Aleph", "hebrewLetter");
    treeOfLife.correspond(path14, "letter:A", "latinLetter");

    treeOfLife.correspond(path14, "Fire", "westernElement");

    treeOfLife.correspond(path14, "Jupiter", "planet");

    const theEmperor = treeOfLife.correspond(path14, "The Emperor", "tarotArkAnnu");

    expect(treeOfLife.related(path14)).toEqual([
      { id: path14, type: "path" },
      { id: "Chokmah", type: "sphere", data: { hebrewName: "Chokmah", englishName: "Wisdom" } },
      { id: "Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding" } },
      { id: "num:4", type: "number" },
      { id: "num:14", type: "number" },
      { id: "letter:Aleph", type: "hebrewLetter" },
      { id: "letter:A", type: "latinLetter" },
      { id: "Fire", type: "westernElement" },
      { id: "Jupiter", type: "planet" },
      { id: "The Emperor", type: "tarotArkAnnu" },
    ]);
 
    expect(treeOfLife.relatedTypes(theEmperor)).toHaveLength(1);
    expect(treeOfLife.walk(theEmperor, 2, "westernElement")).toEqual([
      { id: "Fire", type: "westernElement" },
    ]);
  });

  it('should correctly remove nodes', () => {
    const treeOfLife = new TreeOfLife();

    treeOfLife.addSphere("Chokmah", { hebrewName: "Chokmah", englishName: "Wisdom" }, 2);
    treeOfLife.addSphere("Binah", { hebrewName: "Binah", englishName: "Understanding" }, 3);

    const path14 = treeOfLife.addPath("Chokmah", "Binah", 4);

    treeOfLife.removeNode("Chokmah");

    expect(treeOfLife.related("Chokmah")).toEqual([]);
    expect(treeOfLife.related("Binah")).toEqual([
      { id: "Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding" } },
      { id: "num:3", type: "number" },
      { id: path14, type: "path" },
    ]);
    expect(treeOfLife.related(path14)).toEqual([
      { id: path14, type: "path" },
      { id: "Binah", type: "sphere", data: { hebrewName: "Binah", englishName: "Understanding" } },
      { id: "num:4", type: "number" },
      { id: "num:14", type: "number" },
    ]);
  });
});