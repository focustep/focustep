const ICON_BELL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const ICON_BELL_OFF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

let muted = false;
try { muted = localStorage.getItem('muted') === '1'; } catch(e){}

let audioCtx = null;
let audioUnlocked = false;

function createCtx() {
  if (audioCtx) return audioCtx;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ audioCtx = null; }
  return audioCtx;
}

export function unlockAudio() {
  if (audioUnlocked) return;
  const ctx = createCtx();
  if (!ctx) return;
  audioUnlocked = true;
  const resumeIt = function() {
    if (ctx.state === 'suspended') { ctx.resume().catch(function(){}); }
  };
  resumeIt();
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0);
  } catch(e){}
  setTimeout(resumeIt, 60);
}

export function getAudioCtx() {
  const ctx = createCtx();
  if (!ctx) return null;
  if (ctx.state === 'suspended') { ctx.resume().catch(function(){}); }
  return ctx;
}

export function playSoftClick() {
  if (muted) return;
  unlockAudio();
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1400;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.exponentialRampToValueAtTime(340, now + 0.09);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  try { osc.start(now); osc.stop(now + 0.15); } catch(e){}
}

export function playWheelTick() {
  if (muted) return;
  unlockAudio();
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Authentic iOS picker wheel mechanical click sound
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.Q.value = 3.2;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1800, now);
  osc.frequency.exponentialRampToValueAtTime(380, now + 0.016);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.020);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  try {
    osc.start(now);
    osc.stop(now + 0.024);
  } catch(e){}

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(8); } catch(e){}
  }
}

export function playChime(kind) {
  if (muted) return;
  unlockAudio();
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const sets = {
    phase: [659.25, 880],
    complete: [523.25, 659.25, 783.99]
  };
  const notes = sets[kind] || sets.phase;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2400;
  filter.connect(ctx.destination);
  notes.forEach(function(freq, i){
    const start = now + i * 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
    osc.connect(gain);
    gain.connect(filter);
    try { osc.start(start); osc.stop(start + 0.65); } catch(e){}
  });
}

export function initSound() {
  const muteBtn = document.getElementById('mute-toggle');
  function applyMuteBtn() {
    if (muteBtn) muteBtn.innerHTML = muted ? ICON_BELL_OFF : ICON_BELL;
  }
  applyMuteBtn();

  if (muteBtn) {
    muteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const wasMuted = muted;
      muted = !muted;
      try { localStorage.setItem('muted', muted ? '1' : '0'); } catch(e){}
      applyMuteBtn();

      muteBtn.classList.remove('anim-ringing', 'anim-muted');
      void muteBtn.offsetWidth;
      muteBtn.classList.add(muted ? 'anim-muted' : 'anim-ringing');
      setTimeout(() => {
        muteBtn.classList.remove('anim-ringing', 'anim-muted');
      }, 700);

      if (wasMuted && !muted) {
        playSoftClick();
      }
    });
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach(function(evt) {
    document.addEventListener(evt, unlockAudio, { once: true, passive: true });
  });

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.id === 'mute-toggle') return;
    playSoftClick();
  }, true);
}
