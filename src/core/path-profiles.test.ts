import { describe, expect, it } from "vitest";
import {
  getCanonicalTree,
  getPathProfile,
  getSpherePathProfiles,
  id,
  KaabalahTypes,
  listPathProfiles,
  PATH_PROFILES,
} from "./index";

/** A value with every string replaced, so the two languages can be compared by structure. */
function shape(value: unknown): unknown {
  if (typeof value === "string") return value.trim() ? "text" : "empty";
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  }
  return value;
}

describe("getPathProfile", () => {
  it("lists the 22 paths in order, each with its facts read from the Tree", () => {
    const tree = getCanonicalTree({ system: "kaabalah", parts: ["westernAstrology", "tarot"] });
    const profiles = listPathProfiles();
    expect(profiles.map(profile => profile.number)).toEqual(Array.from({ length: 22 }, (_, index) => index + 1));

    for (const profile of profiles) {
      const node = tree.getNode(id(KaabalahTypes.PATH, profile.number))!;
      expect(`sphere:${profile.from}`).toBe(node.data!.from);
      expect(`sphere:${profile.to}`).toBe(node.data!.to);
      expect(profile.meaning).toBe(node.data!.meaning);
      for (const fact of [profile.hebrewLetter, profile.tarotCard, profile.correspondence]) {
        expect(fact, `path ${profile.number}`).toBeTruthy();
      }
    }
  });

  it("resolves a number, a path ID, a card name or alias and a Hebrew letter", () => {
    const path = getPathProfile(13)!;
    for (const lookup of ["13", " path:13 ", path.tarotCard, path.tarotCard.toUpperCase(), `tarotArkAnnu:${path.tarotCard}`, path.hebrewLetter]) {
      expect(getPathProfile(lookup)?.number, lookup).toBe(13);
    }
    for (const lookup of [0, 23, "path:0", "path:23", "", "sphere:Hod", "nothing"]) {
      expect(getPathProfile(lookup), String(lookup)).toBeUndefined();
    }
  });

  it("selects Portuguese for pt and pt-BR and English for anything else", () => {
    const en = getPathProfile(7)!, pt = getPathProfile(7, "pt-BR")!;
    expect(en.language).toBe("en");
    expect(pt.language).toBe("pt");
    expect(pt.essence).not.toBe(en.essence);
    expect(pt.meaning).not.toBe(en.meaning);
    expect(pt.mantras).toEqual(en.mantras);
    expect(getPathProfile(7, "pt")).toEqual(pt);
    expect(getPathProfile(7, "fr")).toEqual(en);
  });

  it("has every text in both languages", () => {
    for (const en of listPathProfiles()) {
      const pt = getPathProfile(en.number, "pt")!;
      expect(shape({ ...pt, language: "en" }), `path ${en.number}`).toEqual(shape(en));
      expect(JSON.stringify(shape(en)), `path ${en.number}`).not.toContain("empty");
    }
  });

  it("finds the paths of a sphere", () => {
    const paths = getSpherePathProfiles("sphere:Malkuth", "pt");
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every(path => path.to === "Malkuth" || path.from === "Malkuth")).toBe(true);
    expect(paths.every(path => path.language === "pt")).toBe(true);
    expect(getSpherePathProfiles("hod")).toEqual(getSpherePathProfiles("Hod"));
    expect(getSpherePathProfiles("nowhere")).toEqual([]);

    // Every path belongs to exactly two spheres.
    const tree = getCanonicalTree({ system: "kaabalah", parts: [] });
    const total = tree.getNodes(KaabalahTypes.SPHERE).reduce((sum, sphere) => sum + getSpherePathProfiles(sphere.id).length, 0);
    expect(total).toBe(44);
  });

  it("returns a copy, so a caller cannot change the shared data", () => {
    getPathProfile(2)!.keywords.push("changed");
    expect(getPathProfile(2)!.keywords).not.toContain("changed");
    expect(Object.isFrozen(PATH_PROFILES["2"].keywords.en)).toBe(true);
  });
});
