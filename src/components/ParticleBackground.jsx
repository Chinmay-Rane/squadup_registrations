import { useEffect, useRef } from 'react';

export default function ParticleBackground({ active = true, densityMultiplier = 1.0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    // Particle class
    class Particle {
      constructor() {
        this.reset();
        // Distribute initially throughout the screen
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20; // start from bottom
        this.size = Math.random() * 1.8 + 0.6; // 0.6px to 2.4px
        this.speedX = (Math.random() - 0.5) * 0.25; // drift sideways
        this.speedY = -(Math.random() * 0.4 + 0.1); // float upwards
        this.baseAlpha = Math.random() * 0.4 + 0.1;
        this.alpha = this.baseAlpha;
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Twinkle effect (alpha oscillation)
        this.alpha += this.fadeDirection * this.fadeSpeed;
        if (this.alpha >= this.baseAlpha + 0.15 || this.alpha >= 0.7) {
          this.fadeDirection = -1;
        } else if (this.alpha <= this.baseAlpha - 0.15 || this.alpha <= 0.05) {
          this.fadeDirection = 1;
        }

        // Out of screen bounds check
        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Crimson and Accent colors combined with alpha
        const colorRatio = Math.random();
        if (colorRatio > 0.75) {
          ctx.fillStyle = `rgba(255, 45, 85, ${this.alpha * 0.8})`; // Accent color
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`; // White stars
        }
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      // Adjust particle counts based on viewport width
      const baseCount = width < 768 ? 30 : 75;
      const count = Math.floor(baseCount * densityMultiplier);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    window.addEventListener('resize', handleResize);
    initParticles();

    // Loop
    const animate = () => {
      if (!active) return;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background ambient radial highlight if desired (drawn in React instead to prevent canvas overhead)
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, densityMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
