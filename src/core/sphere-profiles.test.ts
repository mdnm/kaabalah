import { describe, expect, it } from "vitest";
import {
  getSphereProfile,
  getSphereSections,
  getTreeSection,
  listSphereProfiles,
  listTreeSections,
  SPHERE_PROFILES,
  SPHERES,
  TREE_SECTION_IDS,
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

describe("getSphereProfile", () => {
  it("lists one profile per sphere of the Tree", () => {
    expect(listSphereProfiles().map(profile => profile.sphere)).toEqual(Object.values(SPHERES));
  });

  it("resolves a name in any case and a sphere node ID, and rejects anything else", () => {
    const geburah = getSphereProfile("Geburah");
    expect(geburah?.sphere).toBe("Geburah");
    expect(getSphereProfile(" geburah ")).toEqual(geburah);
    expect(getSphereProfile("sphere:Geburah")).toEqual(geburah);
    expect(getSphereProfile("Gevurah")).toBeUndefined();
    expect(getSphereProfile("")).toBeUndefined();
  });

  it("selects Portuguese for pt and pt-BR and English for anything else", () => {
    const en = getSphereProfile("Hod")!, pt = getSphereProfile("Hod", "pt-BR")!;
    expect(en.language).toBe("en");
    expect(pt.language).toBe("pt");
    expect(pt.essence).not.toBe(en.essence);
    expect(getSphereProfile("Hod", "pt")).toEqual(pt);
    expect(getSphereProfile("Hod", "fr")).toEqual(en);
  });

  it("has every text in both languages", () => {
    for (const en of listSphereProfiles()) {
      const pt = getSphereProfile(en.sphere, "pt")!;
      expect(shape({ ...pt, language: "en" }), en.sphere).toEqual(shape(en));
      expect(JSON.stringify(shape(en)), en.sphere).not.toContain("empty");
    }
  });

  it("returns a copy, so a caller cannot change the shared data", () => {
    getSphereProfile("Hod")!.keywords.push("changed");
    expect(getSphereProfile("Hod")!.keywords).not.toContain("changed");
    expect(Object.isFrozen(SPHERE_PROFILES.Hod.keywords.en)).toBe(true);
  });
});

describe("tree sections", () => {
  it("resolves a full ID or its short form, in any case", () => {
    const left = getTreeSection("pillar:left");
    expect(left?.id).toBe("pillar:left");
    expect(getTreeSection("LEFT")).toEqual(left);
    expect(getTreeSection("briah")?.id).toBe("world:Briah");
    expect(getTreeSection("pillar:up")).toBeUndefined();
    expect(getTreeSection("")).toBeUndefined();
  });

  it("filters by kind and keeps the declared order", () => {
    expect(listTreeSections().map(section => section.id)).toEqual(TREE_SECTION_IDS);
    for (const kind of ["world", "pillar", "triad"] as const) {
      const sections = listTreeSections({ kind });
      expect(sections.length).toBeGreaterThan(0);
      expect(sections.every(section => section.kind === kind && section.id.startsWith(`${kind}:`))).toBe(true);
    }
  });

  it("has every text in both languages", () => {
    for (const en of listTreeSections()) {
      const pt = getTreeSection(en.id, "pt-BR")!;
      expect(pt.language).toBe("pt");
      expect(shape({ ...pt, language: "en" }), en.id).toEqual(shape(en));
      expect(JSON.stringify(shape(en)), en.id).not.toContain("empty");
    }
  });

  it("names only real spheres, and no sphere twice within a kind", () => {
    const known = Object.values(SPHERES) as string[];
    for (const kind of ["world", "pillar", "triad"] as const) {
      const spheres = listTreeSections({ kind }).flatMap(section => section.spheres);
      expect(spheres.every(sphere => known.includes(sphere))).toBe(true);
      expect(new Set(spheres).size).toBe(spheres.length);
    }
  });

  it("finds the sections of a sphere, with null where it belongs to none", () => {
    const hod = getSphereSections("sphere:Hod", "pt")!;
    expect(hod.pillar.spheres).toContain("Hod");
    expect(hod.world?.spheres).toContain("Hod");
    expect(hod.triad?.spheres).toContain("Hod");
    expect(hod.pillar.language).toBe("pt");

    for (const sphere of Object.values(SPHERES)) {
      const sections = getSphereSections(sphere)!;
      expect(sections.pillar.kind, sphere).toBe("pillar");
      for (const section of [sections.world, sections.triad]) {
        if (section) expect(section.spheres, sphere).toContain(sphere);
      }
    }
    expect(getSphereSections("Daath")!.triad).toBeNull();
    expect(getSphereSections("nowhere")).toBeUndefined();
  });
});
