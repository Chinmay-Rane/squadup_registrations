import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from './components/ParticleBackground';
import LogoGateway from './components/LogoGateway';
import RegistrationForm from './components/RegistrationForm';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const [view, setView] = useState('gateway'); // 'gateway', 'form', or 'admin'
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });

  // Native Hash & Path Routing listener for '/admin' and '#/admin'
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin') {
        setView('admin');
      } else {
        setView((prev) => (prev === 'admin' ? 'gateway' : prev));
      }
    };

    handleRouting();
    window.addEventListener('popstate', handleRouting);
    window.addEventListener('hashchange', handleRouting);

    return () => {
      window.removeEventListener('popstate', handleRouting);
      window.removeEventListener('hashchange', handleRouting);
    };
  }, []);

  // Track mouse coordinates for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth out mouse tracking for parallax physics
  useEffect(() => {
    let animationFrameId;
    
    const updateSmoothCoordinates = () => {
      setSmoothMouse((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.08, // ease factor
          y: prev.y + dy * 0.08
        };
      });
      animationFrameId = requestAnimationFrame(updateSmoothCoordinates);
    };

    updateSmoothCoordinates();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // Translate screen width/height offsets
  const parallaxX = (smoothMouse.x - window.innerWidth / 2) * 0.025;
  const parallaxY = (smoothMouse.y - window.innerHeight / 2) * 0.025;

  const handleBackToGateway = () => {
    // Clear path and hash cleanly
    if (window.location.hash) {
      window.location.hash = '';
    }
    if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
    setView('gateway');
  };

  return (
    <div
      className="relative w-full min-h-screen bg-[#050505] text-white select-none overflow-x-hidden font-sans"
      style={{
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`
      }}
    >
      {/* Dynamic Cursor Light Overlay (Glow spotlight following cursor) */}
      <div className="absolute inset-0 mouse-light-bg z-10" />

      {/* Particle Canvas Layer */}
      <ParticleBackground active={true} densityMultiplier={view === 'form' ? 1.2 : 0.8} />

      {/* Parallax Glowing Ambient Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          style={{
            x: parallaxX,
            y: parallaxY
          }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 filter blur-[120px] mix-blend-screen"
        />
        <motion.div
          style={{
            x: -parallaxX * 1.5,
            y: -parallaxY * 1.5
          }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/10 filter blur-[140px] mix-blend-screen"
        />
      </div>

      {/* Main View Transition Coordinator */}
      <AnimatePresence mode="wait">
        {view === 'gateway' && (
          <motion.div
            key="gateway-view"
            className="w-full h-full"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <LogoGateway onEnterApp={() => setView('form')} />
          </motion.div>
        )}

        {view === 'form' && (
          <motion.div
            key="form-view"
            className="w-full min-h-screen flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <RegistrationForm />
          </motion.div>
        )}

        {view === 'admin' && (
          <motion.div
            key="admin-view"
            className="w-full min-h-screen flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AdminPortal onBackToGateway={handleBackToGateway} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
