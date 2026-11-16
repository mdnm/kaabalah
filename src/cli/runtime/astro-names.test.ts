import { describe, expect, it } from "vitest";

import {
  ANGLE_CONVENTION_NAMES,
  ASPECT_NAMES,
  INPUT_QUALITY_NAMES,
  MIDPOINT_CONVENTION_NAMES,
  ORB_PROFILE_NAMES,
  POINT_ID_NAMES,
  RETURN_PASS_KIND_NAMES,
} from "./astro-names";
import { KNOWN_ASPECT_NAMES, ORB_POLICY_PROFILES } from "../../astrology/orb-policy";
import { POINT_IDS } from "../../astrology/points";
import { PROGRESSED_ANGLE_CONVENTIONS } from "../../astrology/progressions";
import { INPUT_QUALITY_KINDS } from "../../astrology/capabilities";
import { DEFAULT_RETURN_PASS_KINDS } from "../../astrology/timelines";

describe("CLI static name lists match the library", () => {
  it("covers aspects, points, profiles, qualities and conventions", () => {
    expect([...ASPECT_NAMES]).toEqual([...KNOWN_ASPECT_NAMES]);
    expect([...POINT_ID_NAMES]).toEqual([...POINT_IDS]);
    expect([...ORB_PROFILE_NAMES]).toEqual(Object.keys(ORB_POLICY_PROFILES));
    expect([...ANGLE_CONVENTION_NAMES]).toEqual([...PROGRESSED_ANGLE_CONVENTIONS]);
    expect([...INPUT_QUALITY_NAMES]).toEqual(INPUT_QUALITY_KINDS.map((kind) => kind.id));
    for (const kind of DEFAULT_RETURN_PASS_KINDS) expect(RETURN_PASS_KIND_NAMES).toContain(kind);
    expect(MIDPOINT_CONVENTION_NAMES).toHaveLength(2);
  });
});
