"use client";

import * as React from "react";

interface ConfettiCelebrationProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  alpha: number;
}

const COLORS = [
  "#5e6ad2", // Linear lavender
  "#828fff", // Light lavender
  "#27a644", // Emerald success
  "#f5a623", // Amber gold
  "#e5484d", // Coral
  "#38bdf8", // Sky blue
];

export function ConfettiCelebration({ active, onComplete }: ConfettiCelebrationProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = React.useRef(onComplete);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Create 75 particles originating from top-center / screen center
    const particles: Particle[] = Array.from({ length: 75 }).map(() => ({
      x: width * 0.5 + (Math.random() - 0.5) * 200,
      y: height * 0.25 + (Math.random() - 0.5) * 50,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -10 - 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 6 + 4,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 8,
      alpha: 1,
    }));

    let animationId: number;
    const gravity = 0.35;
    const drag = 0.985;
    const startTime = Date.now();
    const duration = 2800; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height);
        onCompleteRef.current?.();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, 1 - elapsed / duration);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      data-testid="confetti-canvas"
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      aria-hidden="true"
    />
  );
}
