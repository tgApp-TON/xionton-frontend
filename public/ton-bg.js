class AuroraBackground {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.max(1, window.devicePixelRatio || 1);

    this.options = {
      starCount: opts.starCount ?? 280,
      animate: opts.animate ?? true,
    };

    this.w = 0;
    this.h = 0;
    this.time = 0;
    this.last = 0;

    this.stars = [];
    
    // Parallax (УСИЛЕННЫЙ)
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);

    window.addEventListener("resize", this.resize);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("touchmove", this.handleTouchMove, { passive: true });
    
    this.resize();
    this.initScene();

    if (this.options.animate) requestAnimationFrame(this.loop);
    else this.render(0);
  }

  rand(min, max) {
    return min + Math.random() * (max - min);
  }

  handleMouseMove(e) {
    // УСИЛЕН с 100 до 200
    this.targetX = (e.clientX / this.w - 0.5) * 200;
    this.targetY = (e.clientY / this.h - 0.5) * 200;
  }

  handleTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      // УСИЛЕН с 100 до 200
      this.targetX = (touch.clientX / this.w - 0.5) * 200;
      this.targetY = (touch.clientY / this.h - 0.5) * 200;
    }
  }

  initScene() {
    this.stars = Array.from({ length: this.options.starCount }, () => ({
      x: this.rand(0, this.w),
      y: this.rand(0, this.h),
      r: this.rand(0.4, 2.0),
      a: this.rand(0.2, 0.95),
      tw: this.rand(0.5, 2.0),
      z: this.rand(0.3, 1.5), // УСИЛЕНО: было 1.0, стало 1.5
    }));
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.w = w;
    this.h = h;

    this.initScene();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  drawSkyBase() {
    const { ctx, w, h } = this;
    
    // Parallax для градиента (УСИЛЕН с 0.3 до 0.6)
    const offsetX = this.currentX * 0.6;
    const offsetY = this.currentY * 0.6;
    
    const g = ctx.createLinearGradient(offsetX, offsetY, w + offsetX, h + offsetY);
    g.addColorStop(0, "#040a34");
    g.addColorStop(0.45, "#11226e");
    g.addColorStop(0.75, "#2f2d89");
    g.addColorStop(1, "#1d144d");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  drawStars(t) {
    const { ctx } = this;
    
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      
      // Parallax эффект (УСИЛЕН с 0.5 до 1.2)
      const parallaxX = this.currentX * s.z * 1.2;
      const parallaxY = this.currentY * s.z * 1.2;
      
      const x = s.x + parallaxX;
      const y = s.y + parallaxY;
      
      const wrappedX = ((x % this.w) + this.w) % this.w;
      const wrappedY = ((y % this.h) + this.h) % this.h;
      
      const tw = 0.65 + 0.35 * Math.sin(t * 0.0015 * s.tw + i * 0.73);
      const alpha = s.a * tw;

      ctx.beginPath();
      ctx.fillStyle = `rgba(210,230,255,${alpha})`;
      ctx.arc(wrappedX, wrappedY, s.r * s.z, 0, Math.PI * 2);
      ctx.fill();

      if (i % 7 === 0) {
        const rg = ctx.createRadialGradient(wrappedX, wrappedY, 0, wrappedX, wrappedY, s.r * 6 * s.z);
        rg.addColorStop(0, `rgba(180,220,255,${alpha * 0.25})`);
        rg.addColorStop(1, "rgba(180,220,255,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(wrappedX, wrappedY, s.r * 6 * s.z, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawVignette() {
    const { ctx, w, h } = this;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const vg = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.25, cx, cy, Math.max(w, h) * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  updateParallax(dt) {
    // Плавное следование (УСИЛЕНО с 0.05 до 0.08 - быстрее реакция)
    const ease = 0.08;
    this.currentX += (this.targetX - this.currentX) * ease;
    this.currentY += (this.targetY - this.currentY) * ease;
  }

  render(t) {
    this.clear();
    this.drawSkyBase();
    this.drawStars(t);
    this.drawVignette();
  }

  loop(ts) {
    if (!this.last) this.last = ts;
    const dt = Math.min(33, ts - this.last);
    this.last = ts;
    this.time += dt;

    this.updateParallax(dt);
    this.render(this.time);
    requestAnimationFrame(this.loop);
  }

  destroy() {
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("touchmove", this.handleTouchMove);
  }
}

if (typeof window !== 'undefined') {
  window.AuroraBackground = AuroraBackground;
  
  const canvas = document.getElementById("ton-bg");
  if (canvas) {
    new AuroraBackground(canvas, {
      starCount: 320,
      animate: true,
    });
  }
}
