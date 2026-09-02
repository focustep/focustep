/**
 * Header Spotlight & Dynamic Motion Glow Typography Cloud
 * Features:
 * 1. Screen size adaptive compact radius (46px everywhere).
 * 2. Canvas-driven dynamic drawing trail (Dissipates over 0.4s / 400ms).
 * 3. Smooth, spring-damped continuous interpolation for all words (zero abrupt jump on leave/enter).
 * 4. Feathered boundaries & energetic neon glow.
 * 5. Dynamic Luminous Particle Sparklets.
 */

export function initHeaderSpotlight() {
  const spotlightZone = document.getElementById('header-spotlight-zone');
  const mainHeader = document.getElementById('main-header');
  if (!spotlightZone || !mainHeader) return;

  const cloudContainer = spotlightZone.querySelector('.header-spotlight-cloud');
  if (!cloudContainer) return;

  // Responsive scattered items with 3D depth layers and organic float phases
  const items = [
    { text: 'just study it', size: 'clamp(10px, 1.1vw, 13px)', weight: '700', top: '16%', left: '4%', rot: -2, op: '0.85', letterSpacing: '-0.01em', depth: 1.15, phase: 0, desktopOnly: true },
    { text: 'focustep', size: 'clamp(14px, 1.6vw, 22px)', weight: '900', top: '44%', left: '7%', rot: 0, op: '0.95', letterSpacing: '-0.03em', depth: 1.45, phase: 1.2 },
    { text: 'just study it', size: 'clamp(9px, 0.95vw, 11px)', weight: '500', top: '74%', left: '13%', rot: 2, op: '0.75', letterSpacing: '0.02em', depth: 0.9, phase: 2.4, desktopOnly: true },
    { text: 'JUST STUDY IT', size: 'clamp(10px, 1.1vw, 14px)', weight: '800', top: '20%', left: '23%', rot: 0, op: '0.9', letterSpacing: '0.04em', depth: 1.25, phase: 3.6 },
    { text: 'focustep', size: 'clamp(11px, 1.15vw, 14px)', weight: '600', top: '64%', left: '28%', rot: -3, op: '0.8', letterSpacing: '-0.02em', depth: 1.05, phase: 4.8, desktopOnly: true },
    { text: 'just study it', size: 'clamp(14px, 1.8vw, 24px)', weight: '900', top: '38%', left: '38%', rot: -1, op: '0.95', letterSpacing: '-0.04em', depth: 1.55, phase: 0.8 },
    { text: 'focustep', size: 'clamp(10px, 1vw, 12px)', weight: '700', top: '14%', left: '50%', rot: 2, op: '0.75', letterSpacing: '0.04em', depth: 1.1, phase: 2.1, desktopOnly: true },
    { text: 'FOCUSTEP', size: 'clamp(11px, 1.3vw, 16px)', weight: '800', top: '66%', left: '52%', rot: 0, op: '0.85', letterSpacing: '0.05em', depth: 1.3, phase: 3.3 },
    { text: 'just study it', size: 'clamp(10px, 1.1vw, 13px)', weight: '600', top: '20%', left: '62%', rot: -2, op: '0.8', letterSpacing: '-0.01em', depth: 1.15, phase: 4.5, desktopOnly: true },
    { text: 'focustep', size: 'clamp(15px, 2.0vw, 25px)', weight: '900', top: '42%', left: '68%', rot: 1, op: '0.95', letterSpacing: '-0.03em', depth: 1.6, phase: 1.6 },
    { text: 'just study it', size: 'clamp(9px, 0.95vw, 11px)', weight: '500', top: '74%', left: '76%', rot: -1, op: '0.7', letterSpacing: '0.01em', depth: 0.95, phase: 2.9, desktopOnly: true },
    { text: 'JUST STUDY IT', size: 'clamp(10px, 1.1vw, 14px)', weight: '800', top: '18%', left: '82%', rot: 2, op: '0.9', letterSpacing: '0.03em', depth: 1.2, phase: 4.1 },
    { text: 'focustep', size: 'clamp(12px, 1.3vw, 16px)', weight: '800', top: '56%', left: '88%', rot: -1, op: '0.9', letterSpacing: '-0.02em', depth: 1.25, phase: 0.5 }
  ];

  // Populate typography cloud elements
  cloudContainer.innerHTML = items.map((item, idx) => `
    <span class="spotlight-word ${item.desktopOnly ? 'spotlight-desktop-only' : ''}" id="spot-word-${idx}" data-depth="${item.depth}" data-base-rot="${item.rot}" data-phase="${item.phase}" style="
      font-size: ${item.size};
      font-weight: ${item.weight};
      top: ${item.top};
      left: ${item.left};
      transform: translateY(-50%) rotate(${item.rot}deg);
      opacity: ${item.op};
      letter-spacing: ${item.letterSpacing};
    ">${item.text}</span>
  `).join('');

  const wordElements = Array.from(cloudContainer.querySelectorAll('.spotlight-word'));

  // Track each word's animated state individually for smooth, seamless damping
  const wordStates = items.map((item) => ({
    currX: 0,
    currY: 0,
    currZ: 0,
    currScale: 1,
    currRot: item.rot,
    currGlow: 0
  }));

  // Create canvas for mask trail
  let trailCanvas = spotlightZone.querySelector('.spotlight-trail-canvas');
  if (!trailCanvas) {
    trailCanvas = document.createElement('canvas');
    trailCanvas.className = 'spotlight-trail-canvas';
    trailCanvas.style.display = 'none';
    spotlightZone.appendChild(trailCanvas);
  }
  const ctx = trailCanvas.getContext('2d', { willReadFrequently: false });

  // Create overlay canvas for glowing sparklet particles
  let particleCanvas = spotlightZone.querySelector('.spotlight-particles-canvas');
  if (!particleCanvas) {
    particleCanvas = document.createElement('canvas');
    particleCanvas.className = 'spotlight-particles-canvas';
    spotlightZone.appendChild(particleCanvas);
  }
  const pCtx = particleCanvas.getContext('2d');

  // Trail points & particles
  const trailPoints = [];
  const particles = [];
  const TRAIL_DURATION = 400; // 0.4s trail lifetime

  function getBaseRadius() {
    return 46;
  }

  let targetX = -999;
  let targetY = -999;
  let currentX = -999;
  let currentY = -999;
  let lastCoordX = -999;
  let lastCoordY = -999;
  let velocity = 0;
  let isHovered = false;

  // 3D Tilt states
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  let currentRadius = getBaseRadius();
  let rafId = null;

  function resizeCanvases() {
    const rect = spotlightZone.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (rect.width > 0 && rect.height > 0) {
      trailCanvas.width = Math.round(rect.width * dpr);
      trailCanvas.height = Math.round(rect.height * dpr);
      particleCanvas.width = Math.round(rect.width * dpr);
      particleCanvas.height = Math.round(rect.height * dpr);
    }
  }

  resizeCanvases();
  window.addEventListener('resize', () => {
    resizeCanvases();
  });

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      resizeCanvases();
    });
    ro.observe(spotlightZone);
  }

  function getCurrentPhasePalette() {
    if (document.body.classList.contains('phase-long-break')) {
      return {
        name: 'long-break',
        glowRgb: '112, 150, 255',
        shadowRgb: '43, 69, 199',
        particle1: '112, 150, 255',
        particle2: '74, 112, 247'
      };
    }
    if (document.body.classList.contains('phase-break')) {
      return {
        name: 'short-break',
        glowRgb: '74, 222, 128',
        shadowRgb: '17, 143, 59',
        particle1: '74, 222, 128',
        particle2: '34, 197, 94'
      };
    }
    return {
      name: 'work',
      glowRgb: '100, 255, 218',
      shadowRgb: '78, 201, 176',
      particle1: '100, 255, 218',
      particle2: '78, 201, 176'
    };
  }

  function spawnParticles(x, y, count = 2) {
    const palette = getCurrentPhasePalette();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.6;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.9 + Math.random() * 0.1,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        hue: Math.random() > 0.4 ? palette.particle1 : palette.particle2
      });
    }
  }

  function addTrailPoint(x, y, radius) {
    const now = performance.now();
    trailPoints.push({
      x,
      y,
      radius,
      createdAt: now
    });
  }

  function updateCoordinates(e, immediate = false) {
    const rect = spotlightZone.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    targetX = Math.max(0, Math.min(rect.width, rawX));
    targetY = Math.max(0, Math.min(rect.height, rawY));

    if (lastCoordX > -500) {
      const dx = targetX - lastCoordX;
      const dy = targetY - lastCoordY;
      const dist = Math.hypot(dx, dy);
      velocity = Math.min(dist * 0.6, 25);
    }
    lastCoordX = targetX;
    lastCoordY = targetY;

    // 3D tilt calculation with dynamic springiness
    const normX = (targetX / rect.width - 0.5) * 2;
    const normY = (targetY / rect.height - 0.5) * 2;

    targetTiltY = normX * 16;
    targetTiltX = -normY * 20;

    if (!isHovered || immediate) {
      isHovered = true;
      currentX = targetX;
      currentY = targetY;
      currentTiltX = targetTiltX;
      currentTiltY = targetTiltY;
    }

    addTrailPoint(targetX, targetY, getBaseRadius());

    if (Math.random() < 0.65 || velocity > 4) {
      spawnParticles(targetX, targetY, velocity > 8 ? 3 : 1);
    }
  }

  function renderTrailAndMask(now) {
    const rect = spotlightZone.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    let activeTrailCount = 0;
    for (let i = trailPoints.length - 1; i >= 0; i--) {
      const pt = trailPoints[i];
      const age = now - pt.createdAt;
      if (age > TRAIL_DURATION) {
        trailPoints.splice(i, 1);
        continue;
      }

      // Smooth decay curve over 0.4s
      const progress = age / TRAIL_DURATION;
      const alpha = Math.max(0, 1 - Math.pow(progress, 0.85));

      if (alpha > 0.005) {
        activeTrailCount++;
        const px = pt.x * dpr;
        const py = pt.y * dpr;
        const pr = pt.radius * dpr;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, pr);
        grad.addColorStop(0, `rgba(0, 0, 0, ${alpha.toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(0, 0, 0, ${(alpha * 0.85).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Active pointer head
    if (isHovered && currentX > -500 && currentY > -500) {
      const px = currentX * dpr;
      const py = currentY * dpr;
      const pr = currentRadius * dpr;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, pr);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.9)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Apply smooth mask without flash
    if (activeTrailCount > 0 || isHovered) {
      const maskUrl = `url(${trailCanvas.toDataURL()})`;
      cloudContainer.style.webkitMaskImage = maskUrl;
      cloudContainer.style.maskImage = maskUrl;
      cloudContainer.style.webkitMaskSize = '100% 100%';
      cloudContainer.style.maskSize = '100% 100%';
      cloudContainer.style.webkitMaskRepeat = 'no-repeat';
      cloudContainer.style.maskRepeat = 'no-repeat';
    } else {
      const emptyMask = 'radial-gradient(circle 0px at -999px -999px, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)';
      cloudContainer.style.webkitMaskImage = emptyMask;
      cloudContainer.style.maskImage = emptyMask;
    }
  }

  function renderParticles() {
    if (!pCtx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      const px = p.x * dpr;
      const py = p.y * dpr;
      const pr = p.size * p.life * dpr;
      const alpha = p.alpha * p.life;

      pCtx.shadowBlur = 10 * dpr;
      pCtx.shadowColor = `rgba(${p.hue}, 0.9)`;
      pCtx.fillStyle = `rgba(${p.hue}, ${alpha.toFixed(3)})`;

      pCtx.beginPath();
      pCtx.arc(px, py, Math.max(0.5, pr), 0, Math.PI * 2);
      pCtx.fill();
    }
    pCtx.shadowBlur = 0;
  }

  function loop(now) {
    const baseR = getBaseRadius();
    const time = now * 0.0025;

    // Smoothly decay velocity
    velocity *= 0.92;

    if (isHovered) {
      currentX += (targetX - currentX) * 0.45;
      currentY += (targetY - currentY) * 0.45;
      currentTiltX += (targetTiltX - currentTiltX) * 0.14;
      currentTiltY += (targetTiltY - currentTiltY) * 0.14;
    } else {
      // Smoothly relax tilt back to 0 without snapping
      currentTiltX += (0 - currentTiltX) * 0.08;
      currentTiltY += (0 - currentTiltY) * 0.08;
    }

    currentRadius += (baseR - currentRadius) * 0.15;

    // 3D container transform
    cloudContainer.style.transform = `
      rotateX(${currentTiltX.toFixed(2)}deg)
      rotateY(${currentTiltY.toFixed(2)}deg)
    `;

    const rect = spotlightZone.getBoundingClientRect();

    // Continuous, smooth damping calculation for each individual word
    wordElements.forEach((el, idx) => {
      const depth = parseFloat(el.getAttribute('data-depth')) || 1;
      const baseRot = parseFloat(el.getAttribute('data-base-rot')) || 0;
      const phase = parseFloat(el.getAttribute('data-phase')) || 0;
      const state = wordStates[idx];
      
      // Ambient floating wave
      const waveY = Math.sin(time + phase) * 2.4 * depth;
      const waveX = Math.cos(time * 0.8 + phase) * 1.5;

      let targetWordX = waveX;
      let targetWordY = waveY;
      let targetWordZ = 0;
      let targetWordScale = 1;
      let targetWordRot = baseRot;
      let targetWordGlow = 0;

      if (isHovered && currentX > -500 && currentY > -500) {
        const elLeft = (parseFloat(el.style.left) / 100) * rect.width;
        const elTop = (parseFloat(el.style.top) / 100) * rect.height;
        const dist = Math.hypot(currentX - elLeft, currentY - elTop);
        const proximity = Math.max(0, 1 - dist / (currentRadius * 1.55));

        const magnetX = proximity > 0 ? (currentX - elLeft) * 0.07 * proximity : 0;
        const magnetY = proximity > 0 ? (currentY - elTop) * 0.07 * proximity : 0;
        const parallaxX = (currentTiltY * depth * 0.4);
        const parallaxY = (-currentTiltX * depth * 0.4);

        targetWordX = parallaxX + waveX + magnetX;
        targetWordY = parallaxY + waveY + magnetY;
        targetWordZ = (proximity * 24) + (velocity * 0.4);
        targetWordScale = 1 + (proximity * 0.18) + (velocity * 0.006);
        targetWordRot = baseRot + (proximity * (magnetX > 0 ? 2.5 : -2.5));
        targetWordGlow = proximity;
      }

      // Smooth damping interpolation (no jumping / popping)
      const lerpSpeed = isHovered ? 0.22 : 0.08;
      state.currX += (targetWordX - state.currX) * lerpSpeed;
      state.currY += (targetWordY - state.currY) * lerpSpeed;
      state.currZ += (targetWordZ - state.currZ) * lerpSpeed;
      state.currScale += (targetWordScale - state.currScale) * lerpSpeed;
      state.currRot += (targetWordRot - state.currRot) * lerpSpeed;
      state.currGlow += (targetWordGlow - state.currGlow) * lerpSpeed;

      el.style.transform = `
        translate3d(${state.currX.toFixed(1)}px, calc(-50% + ${state.currY.toFixed(1)}px), ${state.currZ.toFixed(1)}px)
        scale(${state.currScale.toFixed(2)})
        rotate(${state.currRot.toFixed(1)}deg)
      `;

      const isCompact = window.innerWidth <= 1024;
      const palette = getCurrentPhasePalette();

      if (state.currGlow > 0.02) {
        if (isCompact) {
          const glowBright = (0.6 + state.currGlow * 0.25).toFixed(2);
          el.style.filter = `drop-shadow(0 0 ${(4 + state.currGlow * 8).toFixed(0)}px rgba(${palette.glowRgb}, ${glowBright})) brightness(${(1 + state.currGlow * 0.2).toFixed(2)})`;
        } else {
          const glowBright = (0.7 + state.currGlow * 0.3).toFixed(2);
          el.style.filter = `drop-shadow(0 0 ${(8 + state.currGlow * 14).toFixed(0)}px rgba(${palette.glowRgb}, ${glowBright})) brightness(${(1 + state.currGlow * 0.35).toFixed(2)})`;
        }
      } else {
        el.style.filter = isCompact 
          ? `drop-shadow(0 0 3px rgba(${palette.shadowRgb}, 0.35))`
          : `drop-shadow(0 0 5px rgba(${palette.shadowRgb}, 0.5))`;
      }
    });

    // Render trail mask and particles
    renderTrailAndMask(now);
    renderParticles();

    rafId = requestAnimationFrame(loop);
  }

  // Pointer events
  spotlightZone.addEventListener('pointerenter', (e) => {
    updateCoordinates(e, true);
  });

  spotlightZone.addEventListener('pointermove', (e) => {
    updateCoordinates(e);
  });

  spotlightZone.addEventListener('pointerleave', () => {
    isHovered = false;
    targetTiltX = 0;
    targetTiltY = 0;
    lastCoordX = -999;
    lastCoordY = -999;
    velocity = 0;
  });

  // Touch events
  spotlightZone.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      updateCoordinates(e.touches[0], true);
      spawnParticles(targetX, targetY, 1);
    }
  }, { passive: true });

  spotlightZone.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updateCoordinates(e.touches[0]);
    }
  }, { passive: true });

  spotlightZone.addEventListener('touchend', () => {
    isHovered = false;
    targetTiltX = 0;
    targetTiltY = 0;
    lastCoordX = -999;
    lastCoordY = -999;
    velocity = 0;
  });

  // Start loop
  requestAnimationFrame(loop);
}
