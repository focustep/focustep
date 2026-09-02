import { pad2 } from '../helpers.js';
import { playWheelTick } from '../sound.js';

export class IOSWheelPicker {
  constructor(options) {
    this.container = options.container;
    this.ribbon = options.ribbon;
    this.inputEl = options.inputEl;
    this.max = options.max;
    this.count = this.max + 1;
    this.fastReroll = !!options.fastReroll;
    this.onChange = options.onChange || function(){};

    this.radius = 56;
    this.stepAngle = 26;
    this.selectedIndex = Math.min(this.max, Math.max(0, parseInt(this.inputEl.value, 10) || 0));

    this.currentAngle = this.selectedIndex * this.stepAngle;
    this.targetAngle = this.currentAngle;
    
    this.isDragging = false;
    this.hasDragged = false;
    this.startY = 0;
    this.startAngle = 0;
    this.lastY = 0;
    this.lastTime = 0;
    this.lastMoveTime = 0;
    this.velocity = 0;
    this.animating = false;
    this.animFrameId = null;
    this.wheelSnapTimer = null;
    this.soundEnabled = true;
    this.lastTickInt = Math.round(this.currentAngle / this.stepAngle);

    this.initDOM();
    this.render(this.currentAngle);
    this.bindEvents();
  }

  get value() {
    return this.selectedIndex;
  }

  set value(v) {
    this.setValue(v, false);
  }

  initDOM() {
    this.ribbon.innerHTML = '';
    this.items = [];

    for (let i = 0; i < this.count; i++) {
      const item = document.createElement('div');
      item.className = 'wheel-item';
      item.textContent = pad2(i);
      item.dataset.index = String(i);
      this.ribbon.appendChild(item);
      this.items.push(item);
    }
  }

  render(angle) {
    const centerIndex = (angle / this.stepAngle);
    const radFactor = Math.PI / 180;
    const currentCenterInt = Math.round(centerIndex);

    if (this.soundEnabled && this.lastTickInt !== null && this.lastTickInt !== currentCenterInt) {
      this.lastTickInt = currentCenterInt;
      playWheelTick();
    } else {
      this.lastTickInt = currentCenterInt;
    }

    for (let i = 0; i < this.count; i++) {
      let diff = i - centerIndex;
      while (diff > this.count / 2) diff -= this.count;
      while (diff < -this.count / 2) diff += this.count;

      const itemAngle = -diff * this.stepAngle;
      const item = this.items[i];

      if (Math.abs(itemAngle) > 85) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
        const rad = itemAngle * radFactor;
        const translateY = Math.sin(rad) * this.radius;
        const translateZ = (Math.cos(rad) - 1) * this.radius;
        const rotateX = -itemAngle;
        const absDiff = Math.abs(diff);

        item.style.transform = `translateY(${translateY.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg)`;

        if (absDiff < 0.45) {
          item.className = 'wheel-item selected';
          item.style.opacity = '1';
        } else if (absDiff < 1.45) {
          item.className = 'wheel-item neighbor';
          item.style.opacity = '0.55';
        } else {
          item.className = 'wheel-item';
          item.style.opacity = '0.2';
        }
      }
    }
  }

  startPhysicsLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.animating = true;

    const loop = () => {
      if (this.isDragging) {
        this.render(this.currentAngle);
        this.animFrameId = requestAnimationFrame(loop);
        return;
      }

      const diff = this.targetAngle - this.currentAngle;
      const absDiff = Math.abs(diff);

      if (absDiff > 0.04) {
        let stepFactor;
        if (this.fastReroll) {
          if (absDiff > 300) stepFactor = 0.16;
          else if (absDiff > 80) stepFactor = 0.22;
          else if (absDiff > 10) stepFactor = 0.32;
          else stepFactor = 0.48;
        } else {
          if (absDiff > 180) stepFactor = 0.12;
          else if (absDiff > 40) stepFactor = 0.20;
          else if (absDiff > 4) stepFactor = 0.30;
          else stepFactor = 0.42;
        }

        this.currentAngle += diff * stepFactor;
        this.render(this.currentAngle);

        const liveIndex = ((Math.round(this.currentAngle / this.stepAngle) % this.count) + this.count) % this.count;
        if (liveIndex !== this.selectedIndex) {
          this.selectedIndex = liveIndex;
          if (this.inputEl) this.inputEl.value = pad2(liveIndex);
          this.onChange(liveIndex);
        }

        this.animFrameId = requestAnimationFrame(loop);
      } else {
        const targetStep = Math.round(this.targetAngle / this.stepAngle);
        const normalizedIndex = ((targetStep % this.count) + this.count) % this.count;

        this.selectedIndex = normalizedIndex;
        this.currentAngle = normalizedIndex * this.stepAngle;
        this.targetAngle = this.currentAngle;
        this.render(this.currentAngle);
        this.animating = false;
        this.animFrameId = null;

        if (this.inputEl) this.inputEl.value = pad2(normalizedIndex);
        this.onChange(normalizedIndex);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  setValue(val, triggerChange = false) {
    let normalized = Math.round(val) % this.count;
    if (normalized < 0) normalized += this.count;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.animating = false;

    this.selectedIndex = normalized;
    this.targetAngle = normalized * this.stepAngle;
    this.currentAngle = this.targetAngle;
    this.lastTickInt = normalized;
    if (this.inputEl) this.inputEl.value = pad2(normalized);
    this.render(this.currentAngle);

    if (triggerChange) {
      this.onChange(normalized);
    }
  }

  step(direction) {
    const baseStep = Math.round(this.targetAngle / this.stepAngle);
    this.targetAngle = (baseStep + direction) * this.stepAngle;
    this.startPhysicsLoop();
  }

  bindEvents() {
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      if (delta === 0) return;
      
      if (Math.abs(delta) >= 30) {
        const dir = delta < 0 ? 1 : -1;
        this.step(dir);
      } else {
        const deltaAngle = -delta * (this.fastReroll ? 0.75 : 0.55);
        this.currentAngle += deltaAngle;
        this.render(this.currentAngle);

        const liveIndex = ((Math.round(this.currentAngle / this.stepAngle) % this.count) + this.count) % this.count;
        if (liveIndex !== this.selectedIndex) {
          this.selectedIndex = liveIndex;
          if (this.inputEl) this.inputEl.value = pad2(liveIndex);
          this.onChange(liveIndex);
        }

        clearTimeout(this.wheelSnapTimer);
        this.wheelSnapTimer = setTimeout(() => {
          const nearestStep = Math.round(this.currentAngle / this.stepAngle);
          this.targetAngle = nearestStep * this.stepAngle;
          this.startPhysicsLoop();
        }, 50);
      }
    }, { passive: false });

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      this.animating = false;

      this.isDragging = true;
      this.hasDragged = false;
      const pageY = e.pageY ?? (e.touches && e.touches[0] ? e.touches[0].pageY : 0);
      this.startY = pageY;
      this.startAngle = this.currentAngle;
      this.lastY = pageY;
      this.lastTime = performance.now();
      this.lastMoveTime = this.lastTime;
      this.velocity = 0;

      try {
        if (e.pointerId !== undefined && this.container.setPointerCapture) {
          this.container.setPointerCapture(e.pointerId);
        }
      } catch(err){}

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      window.addEventListener('blur', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const pageY = e.pageY ?? (e.touches && e.touches[0] ? e.touches[0].pageY : 0);
      const now = performance.now();
      const dt = Math.max(1, now - this.lastTime);
      const dy = pageY - this.lastY;

      if (Math.abs(pageY - this.startY) > 3) {
        this.hasDragged = true;
      }

      this.velocity = (0.75 * (dy / dt)) + (0.25 * this.velocity);
      this.lastY = pageY;
      this.lastTime = now;
      this.lastMoveTime = now;

      const deltaTotalY = pageY - this.startY;
      const moveSensitivity = this.fastReroll ? 0.95 : 0.85;
      this.currentAngle = this.startAngle + (deltaTotalY * moveSensitivity);
      this.targetAngle = this.currentAngle;
      this.render(this.currentAngle);

      const dragIndex = ((Math.round(this.currentAngle / this.stepAngle) % this.count) + this.count) % this.count;
      if (dragIndex !== this.selectedIndex) {
        this.selectedIndex = dragIndex;
        if (this.inputEl) this.inputEl.value = pad2(dragIndex);
        this.onChange(dragIndex);
      }
    };

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      try {
        if (e && e.pointerId !== undefined && this.container.releasePointerCapture) {
          this.container.releasePointerCapture(e.pointerId);
        }
      } catch(err){}

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('blur', onPointerUp);

      const now = performance.now();
      const effectiveVelocity = (now - this.lastMoveTime > 70) ? 0 : this.velocity;
      const flingMultiplier = this.fastReroll ? 180 : 50;
      const flingMax = this.fastReroll ? 4800 : 1200;
      const fling = Math.max(-flingMax, Math.min(flingMax, effectiveVelocity * flingMultiplier));
      const totalEstimatedAngle = this.currentAngle + fling;

      const nearestStep = Math.round(totalEstimatedAngle / this.stepAngle);
      this.targetAngle = nearestStep * this.stepAngle;
      this.startPhysicsLoop();
    };

    this.container.addEventListener('pointerdown', onPointerDown);

    this.container.addEventListener('click', (e) => {
      if (this.hasDragged) {
        this.hasDragged = false;
        return;
      }
      const rect = this.container.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY < rect.height * 0.35) {
        this.step(1);
      } else if (clickY > rect.height * 0.65) {
        this.step(-1);
      }
    });

    this.container.tabIndex = 0;
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.step(1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.step(-1);
      }
    });
  }
}
