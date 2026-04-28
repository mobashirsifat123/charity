import { expect, test } from "@playwright/test";

import {
  calculateQiblaDirection,
  normalizeDegrees,
  shortestAngleDelta,
} from "../src/lib/qibla";

test.describe("qibla math", () => {
  test("normalizes degrees safely", () => {
    expect(normalizeDegrees(361)).toBe(1);
    expect(normalizeDegrees(-1)).toBe(359);
    expect(normalizeDegrees(Number.NaN)).toBe(0);
  });

  test("uses shortest path around north", () => {
    expect(shortestAngleDelta(359, 1)).toBe(2);
    expect(shortestAngleDelta(1, 359)).toBe(-2);
  });

  test("calculates known qibla bearing for London", () => {
    const bearing = calculateQiblaDirection(51.5072, -0.1276);
    expect(bearing).toBeGreaterThan(117);
    expect(bearing).toBeLessThan(120);
  });
});
