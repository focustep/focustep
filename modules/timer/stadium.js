import { timerState } from './state.js';

export function updateStadiumDimensions() {
  const capsule = document.getElementById('focus-stadium-capsule');
  const track = document.querySelector('.focus-stadium-track');
  const progress = document.getElementById('focus-stadium-progress');
  const svg = document.querySelector('.focus-stadium-svg');
  if (!capsule || !track || !progress || !svg) return;

  const w = capsule.clientWidth;
  const h = capsule.clientHeight;
  if (!w || !h) return;

  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  
  const strokeW = 3.5;
  const halfS = strokeW / 2;

  let d = '';

  if (Math.abs(w - h) <= 2 || w < h) {
    // Circle or vertical fit
    const R = (Math.min(w, h) - strokeW) / 2;
    if (R <= 0) return;
    const cx = w / 2;
    const cy = h / 2;
    // Clockwise circle starting from 12 o'clock (top center)
    d = `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} A ${R} ${R} 0 0 1 ${cx} ${cy - R} Z`;
  } else {
    // Horizontal stadium oval (w > h)
    const r = (h - strokeW) / 2;
    if (r <= 0) return;
    const leftArcCenterX = r + halfS;
    const rightArcCenterX = w - r - halfS;
    const topY = halfS;
    const bottomY = h - halfS;
    const centerX = w / 2;

    if (rightArcCenterX >= leftArcCenterX) {
      // Seamless horizontal stadium path starting at top-center and moving clockwise
      d = `M ${centerX} ${topY} L ${rightArcCenterX} ${topY} A ${r} ${r} 0 0 1 ${rightArcCenterX} ${bottomY} L ${leftArcCenterX} ${bottomY} A ${r} ${r} 0 0 1 ${leftArcCenterX} ${topY} Z`;
    } else {
      // Fallback to circle if space is too constrained for horizontal arcs
      const R = (Math.min(w, h) - strokeW) / 2;
      const cx = w / 2;
      const cy = h / 2;
      d = `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} A ${R} ${R} 0 0 1 ${cx} ${cy - R} Z`;
    }
  }

  track.setAttribute('d', d);
  progress.setAttribute('d', d);

  try {
    const pathLen = progress.getTotalLength();
    if (pathLen > 0) {
      progress.style.strokeDasharray = String(pathLen);
      const frac = timerState.total > 0 ? Math.min(1, Math.max(0, timerState.remaining / timerState.total)) : 0;
      progress.style.strokeDashoffset = String(pathLen * (1 - frac));
    }
  } catch (_) {}
}
