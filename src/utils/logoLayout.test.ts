import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeLogoText,
  computeLogoAnchor,
  computeAdaptiveFontSize,
  DEFAULT_LOGO_CONFIG,
  LOGO_PALETTE_OPTIONS,
  MAX_LOGO_CHARS,
} from "./logoLayout.ts";

test("sanitizeLogoText strictly caps phrase at 7 characters", () => {
  assert.equal(MAX_LOGO_CHARS, 7);
  assert.equal(sanitizeLogoText("VI"), "VI");
  assert.equal(sanitizeLogoText("LEONIDA123"), "LEONIDA");
  assert.equal(sanitizeLogoText("1234567890").length, 7);
  assert.equal(sanitizeLogoText("A\nB"), "A B");
});

test("computeAdaptiveFontSize scales down cleanly for 3-7 character phrases", () => {
  const base = 243;
  assert.equal(computeAdaptiveFontSize(base, 2), base);
  assert.ok(computeAdaptiveFontSize(base, 5) < computeAdaptiveFontSize(base, 3));
  assert.ok(computeAdaptiveFontSize(base, 7) < computeAdaptiveFontSize(base, 5));
});

test("computeLogoAnchor matches cover-scale bottom_center and compact corner positions", () => {
  const center = computeLogoAnchor(675, 900, "bottom_center", 1);
  assert.equal(center.align, "center");
  assert.equal(center.x, 338);
  assert.ok(center.fontSize >= 230);

  const bottomRight = computeLogoAnchor(675, 900, "bottom_right", 1);
  assert.equal(bottomRight.align, "right");
  assert.ok(bottomRight.fontSize < center.fontSize);

  assert.equal(DEFAULT_LOGO_CONFIG.topWordmarkScale, 1);
  assert.equal(LOGO_PALETTE_OPTIONS.length, 3);
});
