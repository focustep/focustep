/**
 * Centralized Time Management for Focustep
 * Allows overriding "now" for testing and time machine simulation.
 */

let overriddenNow = null;

export function getEffectiveNow() {
  if (overriddenNow instanceof Date && !isNaN(overriddenNow.getTime())) {
    return new Date(overriddenNow.getTime());
  }
  return new Date();
}

export function setEffectiveNow(val) {
  if (!val) {
    overriddenNow = null;
  } else {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      overriddenNow = d;
    } else {
      console.warn('[focustepDev] Invalid date passed to setEffectiveNow:', val);
      overriddenNow = null;
    }
  }
}

export function isTimeOverridden() {
  return overriddenNow !== null;
}
