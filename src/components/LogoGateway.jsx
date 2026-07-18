import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/squadup.png';

// Spaced out concentric planetary orbits:
// Grouped in 4 tight concentric orbits (max radius 23vw/vh) to ensure they are always in frame,
// with 2 opposing text planets on each orbit to balance the alignment symmetrically.
// isPrimary: true highlights 'esports', 'technical', and 'game development' for stronger visual hierarchy.
// Spaced out random landing page text elements (will be positioned dynamically without overlapping)
// isPrimary: true highlights 'esports', 'technical', and 'game development' for stronger visual hierarchy.
const FLOATING_WORDS = [
  { text: 'esports', isPrimary: true },
  { text: 'technical', isPrimary: true },
  { text: 'production', isPrimary: false },
  { text: 'design', isPrimary: false },
  { text: 'game development', isPrimary: true },
  { text: 'content creation', isPrimary: false },
  { text: 'marketing', isPrimary: false },
  { text: 'sponsorships', isPrimary: false }
];

export default function LogoGateway({ onEnterApp }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [positions, setPositions] = useState([]);

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

  // Dynamic, collision-free random placement of words on mount and screen resize
  useEffect(() => {
    const calculatePositions = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      
      const isMobile = W < 768;
      const logoW = isMobile ? 220 : 360;
      const logoH = isMobile ? 220 : 360;
      
      // Bounding box for the center logo area
      const logoBox = {
        minX: -logoW / 2,
        maxX: logoW / 2,
        minY: -logoH / 2,
        maxY: logoH / 2
      };

      const placedBoxes = [];
      const newPositions = [];

      for (let i = 0; i < FLOATING_WORDS.length; i++) {
        const word = FLOATING_WORDS[i];
        
        // Estimate dimensions of the word
        const charWidth = isMobile ? 7 : 10;
        const fontSize = word.isPrimary ? (isMobile ? 12 : 14) : (isMobile ? 10 : 12);
        const tracking = word.isPrimary ? 1.45 : 1.35;
        const width = word.text.length * charWidth * tracking;
        const height = fontSize * 2.5; // add padding for spacing

        let placed = false;
        let attempts = 0;
        const maxAttempts = 200;

        while (!placed && attempts < maxAttempts) {
          attempts++;

          // Random position on screen, leaving a margin at the edges
          const marginX = isMobile ? 20 : 50;
          const marginY = isMobile ? 45 : 85;
          
          // Position relative to center
          const x = (Math.random() * (W - width - 2 * marginX)) - W / 2 + marginX + width / 2;
          const y = (Math.random() * (H - height - 2 * marginY)) - H / 2 + marginY + height / 2;

          const box = {
            minX: x - width / 2,
            maxX: x + width / 2,
            minY: y - height / 2,
            maxY: y + height / 2
          };

          // Check overlap with logo
          const overlapsLogo = !(
            box.maxX < logoBox.minX ||
            box.minX > logoBox.maxX ||
            box.maxY < logoBox.minY ||
            box.minY > logoBox.maxY
          );

          if (overlapsLogo) continue;

          // Check overlap with already placed words
          let overlapsOther = false;
          // Add a safety buffer between words
          const bufferX = isMobile ? 12 : 30;
          const bufferY = isMobile ? 8 : 16;
          
          for (const other of placedBoxes) {
            const overlap = !(
              box.maxX + bufferX < other.minX ||
              box.minX - bufferX > other.maxX ||
              box.maxY + bufferY < other.minY ||
              box.minY - bufferY > other.maxY
            );
            if (overlap) {
              overlapsOther = true;
              break;
            }
          }

          if (overlapsOther) continue;

          // Found a valid position!
          placedBoxes.push(box);
          newPositions.push({
            ...word,
            x,
            y,
            // Stagger animation delays randomly so they float differently
            floatDelay: -(Math.random() * 6).toFixed(2)
          });
          placed = true;
        }

        // Fallback if we couldn't place it after maxAttempts (unlikely)
        if (!placed) {
          const angle = (i * (360 / FLOATING_WORDS.length)) * Math.PI / 180;
          const fallbackRadius = isMobile ? Math.min(W, H) * 0.38 : Math.min(W, H) * 0.42;
          newPositions.push({
            ...word,
            x: Math.cos(angle) * fallbackRadius,
            y: Math.sin(angle) * fallbackRadius,
            floatDelay: -(Math.random() * 6).toFixed(2)
          });
        }
      }

      setPositions(newPositions);
    };

    calculatePositions();

    // Recalculate on window resize to keep layout proportional and correct
    window.addEventListener('resize', calculatePositions);
    return () => window.removeEventListener('resize', calculatePositions);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent flex items-center justify-center">
      
      {/* Floating Concentric Symmetrical Words */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
        {positions.map((word, idx) => {
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

          return (
            <div
              key={idx}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                transform: `translate(calc(-50% + ${word.x}px), calc(-50% + ${word.y}px))`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: word.isPrimary ? 1.0 : 0.5, scale: 1 }}
                transition={{ duration: 0.8, delay: idx * 0.08 }}
              >
                <div
                  style={{
                    animation: `word-float 6s ease-in-out infinite`,
                    animationDelay: `${word.floatDelay}s`
                  }}
                >
                  <div
                    className={
                      word.isPrimary
                        ? "text-[12px] md:text-[14px] font-black uppercase tracking-[0.45em] text-white font-sans drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                        : "text-[10px] md:text-[12px] font-bold uppercase tracking-[0.35em] text-white/50 font-sans drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                    }
                  >
                    {word.text}
                  </div>
                </div>
              </motion.div>
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
