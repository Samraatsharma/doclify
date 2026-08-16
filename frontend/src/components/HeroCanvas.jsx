import React, { useEffect, useRef } from 'react';

export default function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for subtle parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 0.4;
      targetMouseY = y * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Respect user prefers-reduced-motion setting
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect mobile viewport to scale down particle count for battery/CPU efficiency
    const isMobileViewport = window.innerWidth < 768;
    const PARTICLE_COUNT = prefersReducedMotion ? 0 : (isMobileViewport ? 350 : 1100);
    
    const particles = [];
    if (!prefersReducedMotion) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radiusBase = 180 + Math.sin(theta * 3) * 35 + Math.cos(phi * 4) * 25;
        const r = radiusBase * (0.85 + Math.random() * 0.3);

        particles.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi),
          baseX: r * Math.sin(phi) * Math.cos(theta),
          baseY: r * Math.sin(phi) * Math.sin(theta),
          baseZ: r * Math.cos(phi),
          size: Math.random() * 1.5 + 0.8,
          pulseSpeed: 0.0015 + Math.random() * 0.002,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = Math.min(width, height) * 0.95;

      // Rotation angles
      const rotY = time * 0.35 + mouseX;
      const rotX = Math.sin(time * 0.2) * 0.15 + mouseY;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Breathing scale
      const breathing = 1 + Math.sin(time * 0.8) * 0.05;

      // Render particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        // Breathing pulse per particle
        const individualPulse = 1 + Math.sin(time * 2 + p.pulseOffset) * 0.08;
        const bx = p.baseX * breathing * individualPulse;
        const by = p.baseY * breathing * individualPulse;
        const bz = p.baseZ * breathing * individualPulse;

        // 3D rotation around Y then X
        const x1 = bx * cosY - bz * sinY;
        const z1 = bx * sinY + bz * cosY;
        const y2 = by * cosX - z1 * sinX;
        const z2 = by * sinX + z1 * cosX;

        // Camera distance offset
        const cameraZ = 450;
        const depth = z2 + cameraZ;

        if (depth > 20) {
          const scale = fov / depth;
          const projX = cx + x1 * scale;
          const projY = cy + y2 * scale;

          // Depth-based alpha fade
          const alpha = Math.max(0.08, Math.min(0.9, (z2 + 220) / 440));
          const pSize = Math.max(0.6, p.size * scale * 0.85);

          ctx.beginPath();
          ctx.arc(projX, projY, pSize, 0, Math.PI * 2);

          // Emerald/Teal gradient coloration
          if (i % 7 === 0) {
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.95})`; // Lighter emerald
          } else if (i % 11 === 0) {
            ctx.fillStyle = `rgba(10, 131, 201, ${alpha * 0.7})`; // Tertiary blue accent
          } else {
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`; // Primary #10B981
          }

          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (!prefersReducedMotion) {
      render();
    } else {
      // Draw a single clean static radial gradient and a few fixed particles if requested, or keep it clear
      ctx.clearRect(0, 0, width, height);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
      {/* Radial emerald glow backdrop */}
      <div 
        className="absolute inset-0 w-full h-full max-w-5xl mx-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.14) 0%, rgba(9, 9, 11, 0) 70%)'
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[1050px] max-h-[900px] object-contain opacity-90 transition-opacity duration-1000"
      />
    </div>
  );
}
