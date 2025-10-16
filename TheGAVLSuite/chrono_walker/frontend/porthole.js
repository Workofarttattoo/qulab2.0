// Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.

/**
 * Chrono Walker Aurora Display - Interactive background with embedded controls
 */

class AuroraDisplay {
  constructor() {
    this.canvas = document.getElementById('aurora-canvas');
    if (!this.canvas) {
      console.error('Aurora canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Animation state
    this.particles = [];
    this.waves = [];
    this.maxParticles = 200;
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.intensity = 1.0;
    this.lastKeystroke = 0;
    this.animationId = null;

    // Color palettes
    this.palettes = [
      ['rgba(0, 255, 127, ', 'rgba(64, 224, 208, ', 'rgba(0, 191, 255, '],
      ['rgba(255, 105, 180, ', 'rgba(186, 85, 211, ', 'rgba(138, 43, 226, '],
      ['rgba(255, 165, 0, ', 'rgba(255, 69, 0, ', 'rgba(255, 20, 147, '],
    ];
    this.currentPalette = 0;

    this.init();
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  init() {
    // Create initial particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }

    // Create initial waves
    for (let i = 0; i < 5; i++) {
      this.waves.push(this.createWave());
    }

    // Bind events
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    document.addEventListener('keydown', (e) => this.onKeyDown(e));

    // Start animation loop
    this.animate();
  }

  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 1.0,
      vy: (Math.random() - 0.5) * 1.0,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      hue: Math.random() * 360,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
    };
  }

  createWave() {
    return {
      y: Math.random() * this.height,
      amplitude: Math.random() * 50 + 30,
      frequency: Math.random() * 0.008 + 0.004,
      speed: Math.random() * 0.3 + 0.15,
      phase: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.25 + 0.1,
      colorIndex: Math.floor(Math.random() * 3),
    };
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.updateInfo('interaction', 'Last: Mouse move');
  }

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Create burst particles
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        opacity: 1.0,
        hue: Math.random() * 360,
        pulsePhase: 0,
        pulseSpeed: 0.04,
        lifetime: 80,
      });
    }

    // Cycle palette
    this.currentPalette = (this.currentPalette + 1) % this.palettes.length;
    this.updateInfo('interaction', 'Last: Click burst');
  }

  onKeyDown(e) {
    this.lastKeystroke = Date.now();
    this.intensity = Math.min(this.intensity + 0.2, 2.0);

    // Create wave
    this.waves.push({
      y: this.height / 2,
      amplitude: 70,
      frequency: 0.012,
      speed: 1.2,
      phase: 0,
      opacity: 0.4,
      colorIndex: Math.floor(Math.random() * 3),
      expanding: true,
    });

    this.updateInfo('interaction', 'Last: Keystroke');
  }

  updateInfo(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  drawParticles() {
    // Update and draw each particle
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Pulse animation
      p.pulsePhase += p.pulseSpeed;
      const pulse = Math.sin(p.pulsePhase) * 0.4 + 0.6;

      // Mouse attraction
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const force = Math.max(0, 120 - dist) / 120;
        p.vx += (dx / dist) * force * 0.015;
        p.vy += (dy / dist) * force * 0.015;
      }

      // Apply velocity
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.x += p.vx * this.intensity;
      p.y += p.vy * this.intensity;

      // Wrap around edges
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Get color
      const colors = this.palettes[this.currentPalette];
      const colorIndex = Math.floor((p.hue / 360) * colors.length) % colors.length;
      const baseColor = colors[colorIndex];
      const opacity = p.opacity * pulse;

      // Draw glow
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      gradient.addColorStop(0, baseColor + opacity + ')');
      gradient.addColorStop(1, baseColor + '0)');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw core
      this.ctx.fillStyle = baseColor + (opacity * 1.2) + ')';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Handle lifetime
      if (p.lifetime !== undefined) {
        p.lifetime--;
        p.opacity *= 0.97;
        if (p.lifetime <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  drawWaves() {
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves[i];
      const colors = this.palettes[this.currentPalette];
      const color = colors[wave.colorIndex % colors.length];

      this.ctx.beginPath();
      for (let x = 0; x <= this.width; x += 8) {
        const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.strokeStyle = color + wave.opacity + ')';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();

      // Update wave
      wave.phase += wave.speed * 0.015;

      if (wave.expanding) {
        wave.amplitude *= 1.015;
        wave.opacity *= 0.98;
        if (wave.opacity < 0.03) {
          this.waves.splice(i, 1);
        }
      }
    }
  }

  animate() {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(5, 5, 8, 0.95)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw waves
    this.drawWaves();

    // Draw particles
    this.drawParticles();

    // Decay intensity
    const timeSinceKey = Date.now() - this.lastKeystroke;
    if (timeSinceKey > 100) {
      this.intensity = Math.max(1.0, this.intensity * 0.995);
    }

    // Update info display
    this.updateInfo('particle-count', `Particles: ${this.particles.length}`);
    this.updateInfo('wave-count', `Waves: ${this.waves.length}`);
    this.updateInfo('intensity', `Intensity: ${this.intensity.toFixed(2)}`);

    // Keep animation going
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// Forecast integration
class ForecastController {
  constructor(aurora) {
    this.aurora = aurora;
    this.forecastBtn = document.getElementById('forecast-btn');

    if (this.forecastBtn) {
      this.forecastBtn.addEventListener('click', () => this.runForecast());
    }
  }

  async runForecast() {
    const periods = parseInt(document.getElementById('periods').value);
    const eventsPerPeriod = parseInt(document.getElementById('events-per-period').value);
    const profile = document.getElementById('profile').value;
    const eventStrength = parseFloat(document.getElementById('event-strength').value);
    const outcomeMean = parseFloat(document.getElementById('outcome-mean').value);
    const outcomeStd = parseFloat(document.getElementById('outcome-std').value);

    const payload = {
      periods,
      events_per_period: eventsPerPeriod,
      profile,
      event_strength: eventStrength,
      outcome_mean: outcomeMean,
      outcome_std: outcomeStd,
    };

    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // Update metrics
      document.getElementById('metric-start').textContent = result.start_mean.toFixed(3);
      const finalIndex = result.trajectory_means.length - 1;
      document.getElementById('metric-proj').textContent = result.trajectory_means[finalIndex].toFixed(3);
      document.getElementById('metric-band').textContent =
        `${result.lo[finalIndex].toFixed(2)} - ${result.hi[finalIndex].toFixed(2)}`;

      // Visual feedback: create wave burst
      for (let i = 0; i < 3; i++) {
        this.aurora.waves.push({
          y: this.aurora.height * (0.3 + i * 0.2),
          amplitude: 80,
          frequency: 0.01,
          speed: 0.8,
          phase: Math.random() * Math.PI,
          opacity: 0.5,
          colorIndex: i,
          expanding: true,
        });
      }

      this.aurora.updateInfo('interaction', 'Last: Forecast run');
    } catch (error) {
      console.error('Forecast failed:', error);
      this.aurora.updateInfo('interaction', 'Last: Forecast error');
    }
  }
}

// Data stream controller
class DataStreamController {
  constructor() {
    this.ledgerStream = document.getElementById('ledger-stream');
    this.loadLedger();
    // Refresh ledger every 5 seconds
    setInterval(() => this.loadLedger(), 5000);
  }

  async loadLedger() {
    try {
      const response = await fetch('/api/ledger');
      const data = await response.json();

      if (data.ledger && data.ledger.length > 0) {
        // Show latest 3 entries
        const latest = data.ledger.slice(-3).reverse();
        this.ledgerStream.innerHTML = latest.map(entry => `
          <div class="ledger-entry">
            <div style="color: #39ffc4; font-weight: 600;">${entry.field || 'N/A'}</div>
            <div style="font-size: 0.7rem; opacity: 0.7;">${entry.kind || 'unknown'} • ${entry.timestamp || 'N/A'}</div>
            <div style="font-size: 0.65rem;">S:${(entry.strength || 0).toFixed(2)} O:${(entry.outcome || 0).toFixed(2)}</div>
          </div>
        `).join('');
      } else {
        this.ledgerStream.innerHTML = '<div style="opacity: 0.5;">No ledger entries yet</div>';
      }
    } catch (error) {
      this.ledgerStream.innerHTML = '<div style="color: #ff4f7a;">Offline</div>';
    }
  }
}

// Initialize on load
let aurora, forecast, dataStream;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    aurora = new AuroraDisplay();
    forecast = new ForecastController(aurora);
    dataStream = new DataStreamController();
  });
} else {
  aurora = new AuroraDisplay();
  forecast = new ForecastController(aurora);
  dataStream = new DataStreamController();
}
