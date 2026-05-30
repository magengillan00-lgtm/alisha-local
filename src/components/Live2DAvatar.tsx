'use client';

// ============================================================
// Alisha Local - Avatar Component (Canvas + Live2D Support)
// ============================================================
import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

const MODEL_PATH = '/avatars/kei_en/kei_basic_free/runtime/kei_basic_free.model3.json';

interface AvatarProps {
  mouthValue?: number;
  className?: string;
}

export default function Live2DAvatar({ mouthValue = 0, className = '' }: AvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const enableLipSync = useAppStore((s) => s.settings.enableLipSync);
  const [live2dLoaded, setLive2dLoaded] = useState(false);
  const live2dAppRef = useRef<unknown>(null);
  const live2dModelRef = useRef<unknown>(null);

  // Try to load Live2D model (optional enhancement)
  useEffect(() => {
    let mounted = true;

    async function tryLoadLive2D() {
      try {
        const PIXI = await import('pixi.js');
        const { Live2DModel } = await import('pixi-live2d-display');

        // Register PIXI globally for pixi-live2d-display
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).PIXI = PIXI;
        }

        const canvas = canvasRef.current;
        if (!canvas || !mounted) return;

        const app = new PIXI.Application({
          view: canvas,
          backgroundAlpha: 0,
          autoStart: true,
          width: canvas.clientWidth || 400,
          height: canvas.clientHeight || 500,
        });

        live2dAppRef.current = app;

        const model = await Live2DModel.from(MODEL_PATH, { autoInteract: false });
        if (!mounted) {
          model.destroy();
          app.destroy(true);
          return;
        }

        live2dModelRef.current = model;

        const scale = Math.min(
          (app.screen.width * 0.8) / model.width,
          (app.screen.height * 0.9) / model.height
        );
        model.scale.set(scale);
        model.x = (app.screen.width - model.width) / 2;
        model.y = (app.screen.height - model.height) / 2;

        // Type cast to add to stage
        (app.stage as any).addChild(model);
        setLive2dLoaded(true);
      } catch (err) {
        console.log('Live2D not available, using canvas avatar:', err);
        setLive2dLoaded(false);
      }
    }

    tryLoadLive2D();

    return () => {
      mounted = false;
      if (live2dAppRef.current) {
        try {
          (live2dAppRef.current as any).destroy(true);
        } catch { /* ignore */ }
        live2dAppRef.current = null;
      }
    };
  }, []);

  // Handle lip sync on Live2D model
  useEffect(() => {
    if (!enableLipSync || !live2dModelRef.current) return;
    try {
      const model = live2dModelRef.current as any;
      const coreModel = model?.internalModel?.coreModel;
      if (coreModel?.setParameterValueById) {
        coreModel.setParameterValueById('ParamMouthOpenY', mouthValue);
      }
    } catch { /* ignore */ }
  }, [mouthValue, enableLipSync]);

  // Draw fallback canvas avatar if Live2D didn't load
  useEffect(() => {
    if (live2dLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.parentElement?.clientWidth || 400;
      const h = canvas.parentElement?.clientHeight || 500;
      canvas.width = w;
      canvas.height = h;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const baseY = h * 0.4;

      // Glow effect
      const glowGrad = ctx.createRadialGradient(cx, baseY, 20, cx, baseY, 150);
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
      glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Body
      ctx.beginPath();
      ctx.ellipse(cx, baseY + 110, 70, 90, 0, 0, Math.PI * 2);
      const bodyGrad = ctx.createLinearGradient(cx, baseY + 20, cx, baseY + 200);
      bodyGrad.addColorStop(0, '#6366f1');
      bodyGrad.addColorStop(1, '#4f46e5');
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(cx, baseY, 55, 0, Math.PI * 2);
      const headGrad = ctx.createRadialGradient(cx - 10, baseY - 10, 5, cx, baseY, 55);
      headGrad.addColorStop(0, '#c4b5fd');
      headGrad.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = headGrad;
      ctx.fill();

      // Eyes
      const eyeY = baseY - 5;
      const eyeSpacing = 18;
      
      // Left eye
      ctx.beginPath();
      ctx.ellipse(cx - eyeSpacing, eyeY, 8, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - eyeSpacing, eyeY - 2, 3, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.ellipse(cx + eyeSpacing, eyeY, 8, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + eyeSpacing, eyeY - 2, 3, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Mouth (with lip sync)
      const mouthY = baseY + 18;
      const mouthOpen = enableLipSync ? mouthValue * 12 : 2;
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, 12, Math.max(2, mouthOpen), 0, 0, Math.PI * 2);
      ctx.fillStyle = '#7c3aed';
      ctx.fill();

      // Hair bangs
      ctx.beginPath();
      ctx.ellipse(cx, baseY - 45, 60, 25, 0, Math.PI, 2 * Math.PI);
      ctx.fillStyle = '#4c1d95';
      ctx.fill();

      // Name tag
      ctx.font = '14px "Noto Sans Arabic", sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center';
      ctx.fillText('أليشا', cx, baseY + 180);
    };

    draw();
    animFrameRef.current = requestAnimationFrame(function loop() {
      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    });

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [live2dLoaded, mouthValue, enableLipSync]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      {/* Status indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${live2dLoaded ? 'bg-green-400' : 'bg-yellow-400'}`} />
        <span className="text-[9px] text-slate-400">
          {live2dLoaded ? 'Live2D' : 'Canvas'}
        </span>
      </div>
    </div>
  );
}
