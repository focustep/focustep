export function isWhiteColor(hexStr) {
  if (!hexStr || typeof hexStr !== 'string') return false;
  const clean = hexStr.trim().toLowerCase().replace(/^#/, '');
  // Matches pure white variations and the previously clamped pinky white #f5c4c4
  return clean === 'fff' || clean === 'ffffff' || clean === 'f8fafc' || clean === 'f1f5f9' || clean === 'f5c4c4';
}

export function clampSafeHsv(h, s, v) {
  // If near-white or achromatic high brightness, preserve pure solid neon white
  if (s < 0.08 && v > 0.85) {
    return { h: 0, s: 0, v: 1.0 };
  }
  // Ensure saturation is never washed out (min 20%) for colored hues
  const safeS = Math.max(0.20, Math.min(1.0, s));
  // Ensure value/brightness is never pitch-black (min 28%) and never blinding white (max 96%)
  const safeV = Math.max(0.28, Math.min(0.96, v));
  return { h, s: safeS, v: safeV };
}

export function getSafeColor(hexStr) {
  if (!hexStr || typeof hexStr !== 'string') return '#4ec9b0';
  if (isWhiteColor(hexStr)) return '#ffffff';
  const hsv = hexToHsv(hexStr);
  if (hsv.s < 0.08 && hsv.v > 0.85) {
    return '#ffffff';
  }
  const safe = clampSafeHsv(hsv.h, hsv.s, hsv.v);
  return hsvToHex(safe.h, safe.s, safe.v);
}

export function getLuminance(hexStr) {
  const hex = hexStr.replace(/^#/, '');
  if (hex.length !== 6) return 0.5;
  const num = parseInt(hex, 16);
  if (isNaN(num)) return 0.5;
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastingTextColor(hexStr, darkText = '#12181d', lightText = '#ffffff') {
  const hex = (hexStr || '').replace(/^#/, '');
  if (hex.length !== 6) return lightText;
  const num = parseInt(hex, 16);
  if (isNaN(num)) return lightText;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  // YIQ formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? darkText : lightText;
}

export function getThemeSafeColor(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return '#4ec9b0';
  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  if (isWhiteColor(hexColor)) {
    return isLight ? '#1e293b' : '#ffffff';
  }
  const { h, s, v } = hexToHsv(hexColor);

  if (!isLight) {
    // Dark Theme: If color is too dark to see against dark background (#12181d), boost brightness
    if (v < 0.38) {
      return hsvToHex(h, Math.max(s, 0.45), 0.55);
    }
  } else {
    // Light Theme: If color is too light/faded to see against light background, boost contrast
    if (v > 0.82 && s < 0.45) {
      return hsvToHex(h, Math.max(s, 0.65), 0.58);
    }
  }
  return hexColor;
}

export function hsvToHex(h, s, v) {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsv(hexStr) {
  let hex = hexStr.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return { h: 240, s: 0.6, v: 0.9 };
  const num = parseInt(hex, 16);
  if (isNaN(num)) return { h: 240, s: 0.6, v: 0.9 };
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, v };
}
