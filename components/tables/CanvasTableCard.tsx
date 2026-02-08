'use client';
import { useEffect, useRef } from 'react';

interface TablePosition {
  id: number;
  partnerNickname: string;
  position: number;
}

interface CanvasTableCardProps {
  tableNumber: number;
  price: number;
  cycles: number;
  slots: (TablePosition | undefined)[];
  isActive: boolean;
}

export function CanvasTableCard({ tableNumber, price, cycles, slots, isActive }: CanvasTableCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 400;
    const height = 560;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Stars data
    const stars: { x: number; y: number; size: number; opacity: number; speed: number }[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.5 + 0.2
      });
    }

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const drawDiamond = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      // White fill with glow
      ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
      ctx.shadowBlur = 20;
      
      const s = size;
      
      // Main diamond shape - white fill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.4);
      ctx.lineTo(s * 0.35, 0);
      ctx.lineTo(0, s * 0.6);
      ctx.lineTo(-s * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      
      // Top facet
      ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.4);
      ctx.lineTo(s * 0.35, 0);
      ctx.lineTo(0, -s * 0.1);
      ctx.lineTo(-s * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      
      // Inner lines
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.4);
      ctx.lineTo(0, s * 0.6);
      ctx.moveTo(-s * 0.35, 0);
      ctx.lineTo(s * 0.35, 0);
      ctx.stroke();
      
      ctx.restore();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const mainCardY = 40;
      const mainCardH = 480;
      const cardX = 20;
      const cardW = width - 40;
      const radius = 28;

      // === DRAW 3D PLATFORM LAYERS (bottom) ===
      const platformLayers = [
        { y: mainCardY + mainCardH + 8, scale: 0.96, opacity: 0.6 },
        { y: mainCardY + mainCardH + 20, scale: 0.92, opacity: 0.4 },
        { y: mainCardY + mainCardH + 32, scale: 0.88, opacity: 0.25 }
      ];

      platformLayers.forEach((layer) => {
        const layerW = cardW * layer.scale;
        const layerX = cardX + (cardW - layerW) / 2;
        
        // Shadow
        ctx.save();
        ctx.globalAlpha = layer.opacity * 0.3;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.filter = 'blur(12px)';
        roundRect(layerX, layer.y + 5, layerW, 8, radius * layer.scale);
        ctx.fill();
        ctx.restore();

        // Platform
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        
        // Gradient fill
        const platformGrad = ctx.createLinearGradient(layerX, layer.y, layerX + layerW, layer.y);
        platformGrad.addColorStop(0, 'rgba(60, 80, 200, 0.8)');
        platformGrad.addColorStop(0.5, 'rgba(100, 60, 180, 0.8)');
        platformGrad.addColorStop(1, 'rgba(200, 60, 160, 0.8)');
        ctx.fillStyle = platformGrad;
        roundRect(layerX, layer.y, layerW, 8, radius * layer.scale);
        ctx.fill();
        
        // Border glow
        const borderGrad = ctx.createLinearGradient(layerX, layer.y, layerX + layerW, layer.y);
        borderGrad.addColorStop(0, 'rgba(0, 200, 255, 0.9)');
        borderGrad.addColorStop(1, 'rgba(255, 100, 200, 0.9)');
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
        ctx.shadowBlur = 15;
        roundRect(layerX, layer.y, layerW, 8, radius * layer.scale);
        ctx.stroke();
        
        ctx.restore();
      });

      // === MAIN CARD ===
      
      // Deep shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.filter = 'blur(25px)';
      roundRect(cardX + 5, mainCardY + 10, cardW, mainCardH, radius);
      ctx.fill();
      ctx.restore();

      // Card background - deep purple gradient
      const bgGrad = ctx.createRadialGradient(
        cardX + cardW / 2, mainCardY + mainCardH * 0.3, 
        0, 
        cardX + cardW / 2, mainCardY + mainCardH * 0.5, 
        cardW * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(30, 20, 80, 0.95)');
      bgGrad.addColorStop(0.5, 'rgba(20, 15, 60, 0.95)');
      bgGrad.addColorStop(1, 'rgba(40, 10, 70, 0.95)');
      ctx.fillStyle = bgGrad;
      roundRect(cardX, mainCardY, cardW, mainCardH, radius);
      ctx.fill();

      // Animated stars inside card
      ctx.save();
      roundRect(cardX, mainCardY, cardW, mainCardH, radius);
      ctx.clip();
      
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > mainCardY + mainCardH) star.y = mainCardY;
        
        ctx.fillStyle = `rgba(150, 180, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // MASSIVE GLOW BORDER
      const pulse = 0.7 + Math.sin(time * 0.002) * 0.3;
      
      // Outer glow layers
      for (let i = 0; i < 3; i++) {
        ctx.save();
        const glowGrad = ctx.createLinearGradient(cardX, mainCardY, cardX + cardW, mainCardY + mainCardH);
        glowGrad.addColorStop(0, `rgba(0, 220, 255, ${0.4 * pulse})`);
        glowGrad.addColorStop(0.5, `rgba(180, 100, 255, ${0.5 * pulse})`);
        glowGrad.addColorStop(1, `rgba(255, 80, 200, ${0.4 * pulse})`);
        
        ctx.strokeStyle = glowGrad;
        ctx.lineWidth = 4 + i * 2;
        ctx.shadowColor = i === 0 ? 'rgba(100, 200, 255, 0.8)' : 'rgba(255, 100, 200, 0.6)';
        ctx.shadowBlur = 25 + i * 10;
        roundRect(cardX - i, mainCardY - i, cardW + i * 2, mainCardH + i * 2, radius + i);
        ctx.stroke();
        ctx.restore();
      }

      // === HEADER - Diamond + Table ===
      const headerY = mainCardY + 40;
      drawDiamond(cardX + 50, headerY, 35);
      
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.shadowColor = 'rgba(100, 200, 255, 0.5)';
      ctx.shadowBlur = 10;
      ctx.textBaseline = 'middle';
      ctx.fillText(`Table ${tableNumber}`, cardX + 100, headerY);
      ctx.shadowBlur = 0;

      // === SLOTS 2x2 ===
      const slotStartY = mainCardY + 100;
      const slotW = (cardW - 60) / 2;
      const slotH = 80;
      const slotGap = 15;
      
      const slotPositions = [
        { x: cardX + 20, y: slotStartY },
        { x: cardX + 20 + slotW + slotGap, y: slotStartY },
        { x: cardX + 20, y: slotStartY + slotH + slotGap },
        { x: cardX + 20 + slotW + slotGap, y: slotStartY + slotH + slotGap }
      ];

      ctx.font = '17px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';

      slotPositions.forEach((pos, i) => {
        const slot = slots[i];
        
        // Slot bg
        const slotBg = ctx.createLinearGradient(pos.x, pos.y, pos.x, pos.y + slotH);
        slotBg.addColorStop(0, 'rgba(50, 40, 120, 0.6)');
        slotBg.addColorStop(1, 'rgba(30, 20, 80, 0.7)');
        ctx.fillStyle = slotBg;
        roundRect(pos.x, pos.y, slotW, slotH, 16);
        ctx.fill();
        
        // Border
        const slotBorder = ctx.createLinearGradient(pos.x, pos.y, pos.x + slotW, pos.y + slotH);
        slotBorder.addColorStop(0, 'rgba(80, 180, 255, 0.8)');
        slotBorder.addColorStop(1, 'rgba(200, 120, 255, 0.8)');
        ctx.strokeStyle = slotBorder;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(100, 180, 255, 0.5)';
        ctx.shadowBlur = 8;
        roundRect(pos.x, pos.y, slotW, slotH, 16);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Text
        ctx.fillStyle = slot ? 'rgba(255, 255, 255, 0.95)' : 'rgba(150, 160, 180, 0.5)';
        ctx.fillText(slot ? slot.partnerNickname : 'Empty', pos.x + slotW / 2, pos.y + slotH / 2);
      });

      // === TON BAR ===
      const barY = mainCardY + 310;
      const barW = cardW - 40;
      const barH = 70;
      const barX = cardX + 20;
      
      // Bar bg
      const barBg = ctx.createLinearGradient(barX, barY, barX, barY + barH);
      barBg.addColorStop(0, 'rgba(40, 60, 160, 0.9)');
      barBg.addColorStop(1, 'rgba(80, 30, 140, 0.9)');
      ctx.fillStyle = barBg;
      roundRect(barX, barY, barW, barH, 18);
      ctx.fill();
      
      // Bar border with MEGA glow
      const barBorder = ctx.createLinearGradient(barX, barY, barX + barW, barY);
      barBorder.addColorStop(0, 'rgba(0, 230, 255, 1)');
      barBorder.addColorStop(0.5, 'rgba(180, 100, 255, 1)');
      barBorder.addColorStop(1, 'rgba(255, 80, 200, 1)');
      ctx.strokeStyle = barBorder;
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(100, 200, 255, 0.9)';
      ctx.shadowBlur = 20;
      roundRect(barX, barY, barW, barH, 18);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // TON text
      ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(100, 200, 255, 0.6)';
      ctx.shadowBlur = 12;
      ctx.fillText(`${price} TON`, barX + barW / 2, barY + barH / 2 + 2);
      
      // Cycles
      ctx.font = '19px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(240, 245, 255, 0.9)';
      ctx.shadowBlur = 8;
      ctx.fillText(`Cycles closed: ${cycles}`, barX + barW / 2, barY + barH + 35);
      ctx.shadowBlur = 0;
      
      ctx.textAlign = 'left';
    };

    const animate = (timestamp: number) => {
      draw(timestamp);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [tableNumber, price, cycles, slots]);

  return <canvas ref={canvasRef} className="block" />;
}
