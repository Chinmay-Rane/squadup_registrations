import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/squadup.png';

// Spaced out concentric planetary orbits:
// Grouped in 4 tight concentric orbits (max radius 23vw/vh) to ensure they are always in frame,
// with 2 opposing text planets on each orbit to balance the alignment symmetrically.
// isPrimary: true highlights 'esports', 'technical', and 'game development' for stronger visual hierarchy.
const FLOATING_WORDS = [
  // Orbit 1: Inner (radius: 11vw / 11vh)
  { text: 'esports', radiusX: '11vw', radiusY: '11vh', initialAngle: 0, duration: 45, isPrimary: true },
  { text: 'technical', radiusX: '11vw', radiusY: '11vh', initialAngle: 180, duration: 45, isPrimary: true },

  // Orbit 2: Middle-Inner (radius: 15vw / 15vh)
  { text: 'production', radiusX: '15vw', radiusY: '15vh', initialAngle: 60, duration: 45 },
  { text: 'design', radiusX: '15vw', radiusY: '15vh', initialAngle: 240, duration: 45 },

  // Orbit 3: Middle-Outer (radius: 19vw / 19vh)
  { text: 'game development', radiusX: '19vw', radiusY: '19vh', initialAngle: 120, duration: 45, isPrimary: true },
  { text: 'content creation', radiusX: '19vw', radiusY: '19vh', initialAngle: 300, duration: 45 },

  // Orbit 4: Outer (radius: 23vw / 23vh)
  { text: 'marketing', radiusX: '23vw', radiusY: '23vh', initialAngle: 90, duration: 45 },
  { text: 'sponsorships', radiusX: '23vw', radiusY: '23vh', initialAngle: 270, duration: 45 }
];

export default function LogoGateway({ onEnterApp }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const canvasRef = useRef(null);
  const hoverParticlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Preload logo image
  useEffect(() => {
    const img = new Image();
    img.src = logoImg;
  }, []);

  const handleLogoClick = () => {
    if (isClicked) return;
    setIsClicked(true);

    // After ripple expansion, merge animation & screen fade, move to form
    setTimeout(() => {
      onEnterApp();
    }, 1500);
  };

  // Canvas Hover Particles (glowing sparks around logo)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = 450);
    let height = (canvas.height = 450);

    class HoverParticle {
      constructor() {
        const angle = Math.random() * Math.PI * 2;
        // Emit from the boundary of the logo
        const radius = 100 + Math.random() * 45;
        this.x = width / 2 + Math.cos(angle) * radius;
        this.y = height / 2 + Math.sin(angle) * radius;
        
        // Speed outwards (slower and more delicate drift)
        const speed = Math.random() * 1.2 + 0.4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Smaller size for subtle spark feel
        this.size = Math.random() * 1.8 + 0.8;
        this.alpha = 1.0;
        this.decay = Math.random() * 0.02 + 0.012;
        this.color = Math.random() > 0.4 ? '#FF2D55' : '#B00020'; // Accent or Primary
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const runLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Add a single particle ~60% of frames for a delicate, sparse stream
      if (isHovered && !isClicked && Math.random() > 0.4) {
        hoverParticlesRef.current.push(new HoverParticle());
      }

      // Update and draw particles
      hoverParticlesRef.current = hoverParticlesRef.current.filter((p) => {
        p.update();
        if (p.alpha > 0) {
          p.draw();
          return true;
        }
        return false;
      });

      // Keep running if there are active particles or hovering
      if (isHovered || hoverParticlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(runLoop);
      } else {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    if (isHovered && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(runLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null; // Essential fix for subsequent hovers
      }
    };
  }, [isHovered, isClicked]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent flex items-center justify-center">
      
      {/* Orbiting Concentric Symmetrical Words */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
        {FLOATING_WORDS.map((word, idx) => {
          // If clicked, they fade out cleanly in place instead of merging together
          if (isClicked) {
            return (
              <motion.div
                key={idx}
                initial={{ opacity: word.isPrimary ? 1.0 : 0.6 }}
                animate={{
                  opacity: 0,
                  scale: 0.8,
                  filter: 'blur(4px)'
                }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                className={
                  word.isPrimary
                    ? "text-[13px] md:text-[15px] font-black uppercase tracking-[0.45em] text-white font-sans drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    : "text-[11px] md:text-[13px] font-bold uppercase tracking-[0.35em] text-white/60 font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                }
              >
                {word.text}
              </motion.div>
            );
          }

          // GPU-Accelerated Orbiting parent and counter-rotating child
          const offsetDelay = -((word.initialAngle / 360) * word.duration);

          return (
            <div
              key={idx}
              className="orbit-parent"
              style={{
                animation: `orbit-rotate ${word.duration}s linear infinite`,
                animationDelay: `${offsetDelay}s`
              }}
            >
              <div
                className="orbit-child"
                style={{
                  transform: `translate(${word.radiusX}, ${word.radiusY})`,
                }}
              >
                {/* Counter-rotation to keep the text upright and horizontal */}
                <div
                  style={{
                    animation: `counter-rotate ${word.duration}s linear infinite`,
                    animationDelay: `${offsetDelay}s`
                  }}
                  className={
                    word.isPrimary
                      ? "text-[12px] md:text-[14px] font-black uppercase tracking-[0.45em] text-white font-sans drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      : "text-[10px] md:text-[12px] font-bold uppercase tracking-[0.35em] text-white/50 font-sans drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                  }
                >
                  {word.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ambient Vignette Overlay behind logo */}
      <AnimatePresence>
        {!isClicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute w-[800px] h-[800px] rounded-full bg-black/90 filter blur-[100px] z-20 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Interactive Gateway Logo Overlay */}
      <AnimatePresence>
        {!isClicked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative z-30 flex flex-col items-center justify-center select-none"
          >
            {/* The Logo Button */}
            <motion.div
              className={`relative cursor-pointer flex items-center justify-center p-12 ${
                isHovered ? 'animate-breath' : 'animate-float'
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleLogoClick}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Particle Canvas on Hover */}
              <canvas
                ref={canvasRef}
                className="absolute w-[450px] h-[450px] pointer-events-none"
                style={{ mixBlendMode: 'screen' }}
              />

              {/* SquadUP Logo */}
              <img
                src={logoImg}
                alt="SquadUP Logo"
                className="w-[260px] md:w-[380px] object-contain transition-transform duration-500 relative z-10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static Monospaced Enter SquadUp Call-To-Action (High Z-Index) */}
      <AnimatePresence>
        {!isClicked && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            exit={{ opacity: 0, y: 15 }}
            onClick={handleLogoClick}
            className="absolute bottom-16 z-50 flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
          >
            <motion.p
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="text-xs md:text-sm tracking-[0.45em] text-white font-mono font-bold uppercase text-center hover:text-accent transition-colors duration-300"
            >
              [ ENTER SQUADUP ]
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple Animation Element */}
      {isClicked && (
        <div className="energy-ripple" style={{ left: '50%', top: '50%' }} />
      )}

      {/* Full screen fade to black overlay when clicked */}
      <div
        className={`absolute inset-0 bg-[#050505] z-40 transition-opacity duration-1000 pointer-events-none ${
          isClicked ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
