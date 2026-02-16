'use client';

import { useEffect, useRef } from 'react';

interface Slot {
  nickname?: string;
  filled?: boolean;
}

interface CanvasTableCardProps {
  tableNumber: number;
  price: number;
  cycles: number;
  slots: [Slot?, Slot?, Slot?, Slot?];
  isActive: boolean;
  isUnlocked: boolean;
  onBuy?: () => void;
  onClick?: () => void;
}

export function CanvasTableCard({ 
  tableNumber, 
  price, 
  cycles, 
  slots,
  isActive,
  isUnlocked,
  onBuy,
  onClick
}: CanvasTableCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const calculateSize = () => {
      if (!containerRef.current) return { width: 495, height: 680 };
      
      const containerWidth = containerRef.current.clientWidth;
      const aspectRatio = 680 / 495; // Taller aspect ratio
      const width = containerWidth;
      const height = width * aspectRatio;
      
      return { width, height };
    };

    const updateCanvasSize = () => {
      if (!cardRef.current) return;
      const { width, height } = calculateSize();
      cardRef.current.resize(width, height);
    };

    // Initial size calculation
    const { width, height } = calculateSize();

    class TonTableCard {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      dpr: number;
      opts: any;
      time: number;
      card: any;
      animationId?: number;
      scale: number;

      constructor(canvas: HTMLCanvasElement, options: any) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.dpr = Math.max(1, window.devicePixelRatio || 1);
        this.time = 0;

        const baseWidth = 495;
        const currentWidth = options.width ?? 495;
        this.scale = currentWidth / baseWidth;

        this.opts = {
          table: options.table ?? 1,
          ton: options.ton ?? 10,
          cyclesClosed: options.cyclesClosed ?? 12,
          slots: options.slots ?? [null, null, null, null],
          width: currentWidth,
          height: options.height ?? 680,
          animate: options.animate ?? true,
          isActive: options.isActive ?? true,
          isUnlocked: options.isUnlocked ?? false,
          onBuy: options.onBuy,
          scale: this.scale,
        };

        this.resize(this.opts.width, this.opts.height);
        
        if (this.opts.animate) {
          this.loop = this.loop.bind(this);
          this.animationId = requestAnimationFrame(this.loop);
        } else {
          this.draw(0);
        }
      }

      resize(width: number, height: number) {
        this.opts.width = width;
        this.opts.height = height;
        const baseWidth = 495;
        this.scale = width / baseWidth;
        this.opts.scale = this.scale;

        this.canvas.width = Math.floor(width * this.dpr);
        this.canvas.height = Math.floor(height * this.dpr);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.draw(0);
      }

      roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        const rr = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
      }

      getAnimatedGradient(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
        const phase = (t * 0.001) % 1;
        
        const colors = [
          { r: 59, g: 130, b: 246 },
          { r: 139, g: 92, b: 246 },
          { r: 236, g: 72, b: 153 },
          { r: 59, g: 130, b: 246 },
        ];

        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        
        for (let i = 0; i < 3; i++) {
          const pos = (i / 2 + phase) % 1;
          const idx = Math.floor(pos * 3);
          const nextIdx = (idx + 1) % 3;
          const localPhase = (pos * 3) % 1;
          
          const c1 = colors[idx];
          const c2 = colors[nextIdx];
          
          const r = Math.round(c1.r + (c2.r - c1.r) * localPhase);
          const g = Math.round(c1.g + (c2.g - c1.g) * localPhase);
          const b = Math.round(c1.b + (c2.b - c1.b) * localPhase);
          
          grad.addColorStop(i / 2, `rgba(${r}, ${g}, ${b}, 0.9)`);
        }
        
        return grad;
      }

      drawDiamondIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = this.opts.isActive ? 'rgba(160, 235, 255, 0.95)' : 'rgba(100, 100, 120, 0.5)';
        ctx.lineWidth = 2 * this.scale;

        const w = s;
        const h = s * 0.72;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w * 0.22, -h * 0.35);
        ctx.lineTo(w * 0.78, -h * 0.35);
        ctx.lineTo(w, 0);
        ctx.lineTo(w * 0.5, h);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w * 0.22, -h * 0.35);
        ctx.lineTo(w * 0.5, 0);
        ctx.lineTo(w * 0.78, -h * 0.35);
        ctx.moveTo(w * 0.22, -h * 0.35);
        ctx.lineTo(w * 0.35, 0);
        ctx.lineTo(w * 0.5, h);
        ctx.moveTo(w * 0.78, -h * 0.35);
        ctx.lineTo(w * 0.65, 0);
        ctx.lineTo(w * 0.5, h);
        ctx.stroke();

        if (this.opts.isActive) {
          ctx.shadowColor = 'rgba(120,220,255,0.9)';
          ctx.shadowBlur = 18 * this.scale;
          ctx.stroke();
        }
        ctx.restore();
      }

      drawPlatforms(t: number) {
        const ctx = this.ctx;
        const W = this.opts.width;
        const H = this.opts.height;
        
        if (!this.opts.isActive) return;

        const cx = W / 2;
        const baseY = H * 0.88;
        const baseW = W * 0.72;
        const baseH = H * 0.045;

        const layers = [
          { scale: 1.08, yOff: 18 * this.scale, alpha: 0.25 },
          { scale: 1.00, yOff: 9 * this.scale, alpha: 0.35 },
          { scale: 0.92, yOff: 0, alpha: 0.45 },
        ];

        layers.forEach((L, idx) => {
          const lw = baseW * L.scale;
          const lh = baseH;
          const x = cx - lw / 2;
          const y = baseY + L.yOff;

          const g = ctx.createLinearGradient(x, y, x + lw, y + lh);
          g.addColorStop(0, `rgba(30, 60, 160, ${L.alpha})`);
          g.addColorStop(0.5, `rgba(60, 40, 180, ${L.alpha})`);
          g.addColorStop(1, `rgba(120, 40, 200, ${L.alpha})`);
          ctx.fillStyle = g;
          this.roundRect(ctx, x, y, lw, lh, 12 * this.scale);
          ctx.fill();

          const pulse = 0.6 + 0.4 * Math.sin(t * 0.003 + idx * 0.8);
          ctx.strokeStyle = this.getAnimatedGradient(ctx, x, y, lw, lh, t);
          ctx.globalAlpha = pulse * 0.7;
          ctx.lineWidth = 2 * this.scale;
          this.roundRect(ctx, x, y, lw, lh, 12 * this.scale);
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      }

      drawCardShell(t: number) {
        const ctx = this.ctx;
        const W = this.opts.width;
        const H = this.opts.height;

        const pad = Math.round(W * 0.08);
        const x = pad;
        const y = Math.round(H * 0.06);
        const w = W - pad * 2;
        const h = H - Math.round(H * 0.20);

        this.card = { x, y, w, h };

        ctx.clearRect(0, 0, W, H);

        this.drawPlatforms(t);

        if (this.opts.isActive) {
          ctx.save();
          ctx.shadowColor = 'rgba(113, 83, 255, 0.6)';
          ctx.shadowBlur = 30 * this.scale;
          this.roundRect(ctx, x, y, w, h, 42 * this.scale);
          ctx.strokeStyle = 'rgba(130,120,255,0.25)';
          ctx.lineWidth = 1 * this.scale;
          ctx.stroke();
          ctx.restore();
        }

        const fill = ctx.createLinearGradient(x, y, x + w, y + h);
        if (this.opts.isActive) {
          fill.addColorStop(0, 'rgba(7, 18, 70, 0.82)');
          fill.addColorStop(0.55, 'rgba(8, 22, 88, 0.78)');
          fill.addColorStop(1, 'rgba(28, 12, 88, 0.78)');
        } else {
          fill.addColorStop(0, 'rgba(20, 20, 30, 0.6)');
          fill.addColorStop(1, 'rgba(30, 30, 40, 0.6)');
        }
        ctx.fillStyle = fill;
        this.roundRect(ctx, x, y, w, h, 42 * this.scale);
        ctx.fill();

        if (this.opts.isActive) {
          const pulse = 0.7 + 0.3 * Math.sin(t * 0.002);
          ctx.strokeStyle = this.getAnimatedGradient(ctx, x, y, w, h, t);
          ctx.globalAlpha = pulse;
          ctx.lineWidth = 3 * this.scale;
          this.roundRect(ctx, x, y, w, h, 42 * this.scale);
          ctx.stroke();
          ctx.globalAlpha = 1;

          ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
          ctx.shadowBlur = 40 * this.scale;
          ctx.lineWidth = 2 * this.scale;
          this.roundRect(ctx, x, y, w, h, 42 * this.scale);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        if (this.opts.isActive) {
          const dustY = y + h * 0.70;
          for (let i = 0; i < 50; i++) {
            const px = x + 12 * this.scale + ((i * 37.17 * this.scale) % (w - 24 * this.scale));
            const py = dustY + ((i * 53.91 * this.scale + (t * 0.02)) % (h - (dustY - y) - 12 * this.scale));
            const a = 0.15 + ((i * 0.07) % 0.3);
            ctx.fillStyle = i % 3 === 0 ? `rgba(90,220,255,${a})` : `rgba(200,120,255,${a})`;
            ctx.beginPath();
            ctx.arc(px, py, ((i % 5) * 0.18 + 0.6) * this.scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      drawHeader() {
        const ctx = this.ctx;
        const { x, y, w } = this.card;

        const iconX = x + w * 0.09;
        const iconY = y + 45 * this.scale;
        this.drawDiamondIcon(ctx, iconX, iconY, 40 * this.scale);

        ctx.font = `700 ${38 * this.scale}px Inter, system-ui, Arial, sans-serif`;
        ctx.fillStyle = this.opts.isActive ? 'rgba(240,248,255,0.95)' : 'rgba(160,160,170,0.7)';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Table ${this.opts.table}`, x + w * 0.35, y + 45 * this.scale);
      }

      drawSlots() {
        const ctx = this.ctx;
        const { x, y, w } = this.card;

        const topY = y + 100 * this.scale;
        const slotW = (w - 60 * this.scale) / 2;
        const slotH = 80 * this.scale;
        const gap = 15 * this.scale;

        const slotPositions = [
          { x: x + 20 * this.scale, y: topY },
          { x: x + 20 * this.scale + slotW + gap, y: topY },
          { x: x + 20 * this.scale, y: topY + slotH + 12 * this.scale },
          { x: x + 20 * this.scale + slotW + gap, y: topY + slotH + 12 * this.scale },
        ];

        ctx.font = `600 ${18 * this.scale}px Inter, system-ui, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        slotPositions.forEach((s, i) => {
          const slot = this.opts.slots[i];
          const filled = slot?.nickname || slot?.filled;

          const fill = ctx.createLinearGradient(s.x, s.y, s.x + slotW, s.y + slotH);
          if (filled && this.opts.isActive) {
            fill.addColorStop(0, 'rgba(34, 197, 94, 0.35)');
            fill.addColorStop(1, 'rgba(59, 130, 246, 0.35)');
          } else {
            fill.addColorStop(0, 'rgba(34, 53, 130, 0.35)');
            fill.addColorStop(1, 'rgba(40, 28, 125, 0.25)');
          }

          ctx.fillStyle = fill;
          this.roundRect(ctx, s.x, s.y, slotW, slotH, 16 * this.scale);
          ctx.fill();

          if (filled && this.opts.isActive) {
            const pulse = 0.6 + 0.4 * Math.sin(this.time * 0.003 + i * 0.5);
            ctx.strokeStyle = this.getAnimatedGradient(ctx, s.x, s.y, slotW, slotH, this.time + i * 500);
            ctx.globalAlpha = pulse;
            ctx.lineWidth = 2.5 * this.scale;
            this.roundRect(ctx, s.x, s.y, slotW, slotH, 16 * this.scale);
            ctx.stroke();
            ctx.globalAlpha = 1;

            ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
            ctx.shadowBlur = 15 * this.scale;
            ctx.lineWidth = 1.5 * this.scale;
            this.roundRect(ctx, s.x, s.y, slotW, slotH, 16 * this.scale);
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else if (!filled || !this.opts.isActive) {
            ctx.strokeStyle = this.opts.isActive ? 'rgba(89,223,255,0.4)' : 'rgba(60,60,70,0.3)';
            ctx.lineWidth = 1.5 * this.scale;
            this.roundRect(ctx, s.x, s.y, slotW, slotH, 16 * this.scale);
            ctx.stroke();
          }

          if (slot?.nickname) {
            ctx.fillStyle = this.opts.isActive ? 'rgba(230,245,255,0.95)' : 'rgba(160,160,170,0.7)';
            ctx.fillText(slot.nickname, s.x + slotW / 2, s.y + slotH / 2);
          } else if (!filled) {
            ctx.fillStyle = 'rgba(120,120,130,0.5)';
            ctx.fillText('Empty', s.x + slotW / 2, s.y + slotH / 2);
          }
        });

        ctx.textAlign = 'left';
      }

      drawTonBar() {
        const ctx = this.ctx;
        const { x, y, w } = this.card;

        const barX = x + 20 * this.scale;
        const barY = y + 295 * this.scale;
        const barW = w - 40 * this.scale;
        const barH = 70 * this.scale;

        const g = ctx.createLinearGradient(barX, barY, barX + barW, barY);
        if (this.opts.isActive) {
          g.addColorStop(0, 'rgba(17,33,125,0.85)');
          g.addColorStop(0.5, 'rgba(18,46,165,0.8)');
          g.addColorStop(1, 'rgba(97,41,163,0.85)');
        } else {
          g.addColorStop(0, 'rgba(40,40,50,0.6)');
          g.addColorStop(1, 'rgba(50,50,60,0.6)');
        }
        ctx.fillStyle = g;
        this.roundRect(ctx, barX, barY, barW, barH, 16 * this.scale);
        ctx.fill();

        if (this.opts.isActive) {
          const pulse = 0.7 + 0.3 * Math.sin(this.time * 0.0025);
          ctx.strokeStyle = this.getAnimatedGradient(ctx, barX, barY, barW, barH, this.time);
          ctx.globalAlpha = pulse;
          ctx.lineWidth = 2.5 * this.scale;
          this.roundRect(ctx, barX, barY, barW, barH, 16 * this.scale);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.font = `700 ${42 * this.scale}px Inter, system-ui, Arial, sans-serif`;
        ctx.fillStyle = this.opts.isActive ? 'rgba(235,245,255,0.98)' : 'rgba(160,160,170,0.7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.opts.ton} TON`, barX + barW / 2, barY + barH / 2);
        ctx.textAlign = 'left';
      }

      drawCycles() {
        const ctx = this.ctx;
        const { x, y, w } = this.card;

        ctx.font = `500 ${28 * this.scale}px Inter, system-ui, Arial, sans-serif`;
        ctx.fillStyle = this.opts.isActive ? 'rgba(234,244,255,0.95)' : 'rgba(160,160,170,0.7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Position cycles text right after the TON bar (barY + barH + small gap)
        ctx.fillText(`Cycles: ${this.opts.cyclesClosed}`, x + w / 2, y + 295 * this.scale + 70 * this.scale + 20 * this.scale);
        ctx.textAlign = 'left';
      }

      drawStatusBar() {
        const ctx = this.ctx;
        const { x, y, w, h } = this.card;
        const H = this.opts.height;

        const barY = y + h - 50 * this.scale;
        const barH = 40 * this.scale;
        const barX = x + 20 * this.scale;
        const barW = w - 40 * this.scale;

        // Background
        const bgGradient = ctx.createLinearGradient(barX, barY, barX + barW, barY + barH);
        if (this.opts.isActive) {
          bgGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
          bgGradient.addColorStop(1, 'rgba(34, 197, 94, 0.15)');
        } else if (this.opts.isUnlocked) {
          bgGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
          bgGradient.addColorStop(1, 'rgba(139, 92, 246, 0.15)');
        } else {
          bgGradient.addColorStop(0, 'rgba(60, 60, 70, 0.2)');
          bgGradient.addColorStop(1, 'rgba(50, 50, 60, 0.15)');
        }
        ctx.fillStyle = bgGradient;
        this.roundRect(ctx, barX, barY, barW, barH, 12 * this.scale);
        ctx.fill();

        // Border
        if (this.opts.isActive) {
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        } else if (this.opts.isUnlocked) {
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
        } else {
          ctx.strokeStyle = 'rgba(100, 100, 110, 0.4)';
        }
        ctx.lineWidth = 2 * this.scale;
        this.roundRect(ctx, barX, barY, barW, barH, 12 * this.scale);
        ctx.stroke();

        // Text
        ctx.font = `700 ${24 * this.scale}px Inter, system-ui, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.opts.isActive) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.95)';
          ctx.fillText('Active', barX + barW / 2, barY + barH / 2);
        } else if (this.opts.isUnlocked) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.95)';
          ctx.fillText('BUY', barX + barW / 2, barY + barH / 2);
        } else {
          ctx.fillStyle = 'rgba(160, 160, 170, 0.7)';
          ctx.fillText('Locked', barX + barW / 2, barY + barH / 2);
        }
        
        ctx.textAlign = 'left';
      }

      draw(timeMs: number) {
        this.time = timeMs;
        this.drawCardShell(timeMs);
        this.drawHeader();
        this.drawSlots();
        this.drawTonBar();
        this.drawCycles();
        this.drawStatusBar();
      }

      loop(ts: number) {
        this.draw(ts);
        this.animationId = requestAnimationFrame(this.loop.bind(this));
      }

      destroy() {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
        }
      }
    }

    const slotsData = slots.map(slot => ({
      nickname: slot?.nickname,
      filled: slot?.filled || !!slot?.nickname
    }));

    cardRef.current = new TonTableCard(canvasRef.current, {
      table: tableNumber,
      ton: price,
      cyclesClosed: cycles,
      slots: slotsData,
      animate: true,
      width,
      height,
      isActive: isActive,
      isUnlocked: isUnlocked,
      onBuy: onBuy
    });

    // Use ResizeObserver to watch container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(containerRef.current);

    // Add click handler for BUY button
    const handleClick = (e: MouseEvent) => {
      if (!canvasRef.current || !isUnlocked || isActive) return;
      const handler = onClick ?? onBuy;
      if (!handler) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const currentWidth = cardRef.current?.opts?.width || 495;
      const currentHeight = cardRef.current?.opts?.height || 560;
      const scale = currentWidth / 495;
      const clickX = (e.clientX - rect.left) / (rect.width / currentWidth);
      const clickY = (e.clientY - rect.top) / (rect.height / currentHeight);

      // Status bar area: bottom 50px scaled (BUY area)
      const statusBarY = currentHeight - 50 * scale;
      const statusBarH = 40 * scale;

      if (clickY >= statusBarY && clickY <= statusBarY + statusBarH) {
        handler();
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
    }

    return () => {
      resizeObserver.disconnect();
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
      }
      cardRef.current?.destroy();
    };
  }, [tableNumber, price, cycles, slots, isActive, isUnlocked, onBuy, onClick]);

  const statusBuy = isUnlocked && !isActive;

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ margin: 0, padding: 0, position: 'relative', cursor: statusBuy ? 'pointer' : 'default' }}
    >
      <canvas ref={canvasRef} className="w-full h-auto" style={{ display: 'block', pointerEvents: statusBuy ? 'none' : 'auto' }} />
      {statusBuy && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Buy table"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'transparent',
            zIndex: 10,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            (onClick ?? onBuy)?.();
          }}
        />
      )}
    </div>
  );
}
