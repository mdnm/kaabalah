import { describe, expect, it } from "vitest";

import { calculateOdu } from "./index";

const expectedOdu = {
  leftNumbers: [2, 1, 1, 8],
  rightNumbers: [9, 2, 9, 4],
  north: 12,
  south: 6,
  east: 9,
  west: 9,
  center: 9,
};

describe("Ifa module", () => {
  it("keeps date-only ISO inputs on the intended civil date", () => {
    expect(calculateOdu(new Date("1984-12-29"))).toEqual(expectedOdu);
  });

  it("keeps local civil-midnight dates stable", () => {
    expect(calculateOdu(new Date(1984, 11, 29))).toEqual(expectedOdu);
  });

  it("matches the CLI noon-UTC parsing path", () => {
    expect(calculateOdu(new Date("1984-12-29T12:00:00.000Z"))).toEqual(expectedOdu);
  });
});
