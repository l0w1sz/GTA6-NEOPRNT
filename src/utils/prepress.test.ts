import test from "node:test";
import assert from "node:assert/strict";
import {
  hexToRgb,
  rgbToHex,
  liftShadowChannel,
  calculateCropTo3x4,
  applySublimationPrepress,
} from "./prepress.ts";

test("hexToRgb and rgbToHex round-trip #141416 and #1C1D21 cleanly", () => {
  assert.deepEqual(hexToRgb("#141416"), { r: 20, g: 20, b: 22 });
  assert.deepEqual(hexToRgb("#1C1D21"), { r: 28, g: 29, b: 33 });
  assert.equal(rgbToHex(20, 20, 22), "#141416");
  assert.equal(rgbToHex(28, 29, 33), "#1C1D21");
});

test("liftShadowChannel raises pure black to floor while leaving midtones untouched", () => {
  assert.equal(liftShadowChannel(0, 20), 20);
  assert.equal(liftShadowChannel(0, 22), 22);
  assert.equal(liftShadowChannel(24, 20), 34);
  assert.equal(liftShadowChannel(48, 20), 48);
  assert.equal(liftShadowChannel(180, 20), 180);
  assert.equal(liftShadowChannel(255, 20), 255);
});

test("calculateCropTo3x4 crops wider and taller images to strict 3:4", () => {
  const wide = calculateCropTo3x4(1600, 1200);
  assert.equal(wide.sw, 900);
  assert.equal(wide.sh, 1200);
  assert.equal(wide.sx, 350);

  const tall = calculateCropTo3x4(900, 1600);
  assert.equal(tall.sw, 900);
  assert.equal(tall.sh, 1200);
});

test("applySublimationPrepress clamps pure #000000 to #141416 and audits crushed black percentage", () => {
  // 2x2 image: 2 pure black pixels (#000000), 2 burnt amber pixels (#D98A3C)
  const rgba = new Uint8ClampedArray([
    0, 0, 0, 255,
    0, 0, 0, 255,
    217, 138, 60, 255,
    217, 138, 60, 255,
  ]);

  const res = applySublimationPrepress(rgba, 2, 2, {
    blackFloorHex: "#141416",
    applyBlackCompensation: true,
    applyFeatheredVignette: false,
    vignetteIntensity: 0,
    highlightPureBlackRisk: false,
  });

  assert.equal(res.audit.crushedBlackPixelsOriginal, 2);
  assert.equal(res.audit.crushedBlackPercentOriginal, 50);
  assert.equal(res.audit.minHexOriginal, "#000000");
  assert.equal(res.audit.minHexCompensated, "#141416");
  assert.equal(res.output[0], 20);
  assert.equal(res.output[1], 20);
  assert.equal(res.output[2], 22);
  // Amber pixel untouched
  assert.equal(res.output[8], 217);
  assert.equal(res.output[9], 138);
  assert.equal(res.output[10], 60);
});

test("applySublimationPrepress diagnostic risk mode flags #000000 pixels", () => {
  const rgba = new Uint8ClampedArray([
    0, 0, 0, 255,
    217, 138, 60, 255,
  ]);
  const res = applySublimationPrepress(rgba, 2, 1, {
    blackFloorHex: "#141416",
    applyBlackCompensation: true,
    applyFeatheredVignette: false,
    vignetteIntensity: 0,
    highlightPureBlackRisk: true,
  });
  assert.equal(res.output[0], 232);
  assert.equal(res.output[1], 93);
  assert.equal(res.output[2], 42);
});

test("applySublimationPrepress clamps pure black to #1C102A for GTA VI Vice City", () => {
  const rgba = new Uint8ClampedArray([0, 0, 0, 255, 242, 140, 56, 255]);
  const res = applySublimationPrepress(rgba, 2, 1, {
    blackFloorHex: "#1C102A",
    applyBlackCompensation: true,
    applyFeatheredVignette: false,
    vignetteIntensity: 0,
    highlightPureBlackRisk: false,
  });
  assert.equal(res.audit.minHexCompensated, "#1C102A");
  assert.equal(res.output[0], 28);
  assert.equal(res.output[1], 16);
  assert.equal(res.output[2], 42);
});
