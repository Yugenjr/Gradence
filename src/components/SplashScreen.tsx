import { useEffect } from 'react';
import { motion } from 'motion/react';
import logoImg from '../assets/logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div id="splash-screen" className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        {/* Sleek branded logo with rounded corners */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 border border-neutral-800 rounded-3xl overflow-hidden flex items-center justify-center bg-[#0d0d0d] shadow-2xl p-1.5"
          >
            <img 
              src={logoImg} 
              alt="Gradence Logo" 
              className="w-full h-full object-contain rounded-2xl bg-white" 
            />
          </motion.div>
          <div className="absolute -inset-1.5 border border-white/5 rounded-3xl scale-105 pointer-events-none" />
        </div>

        {/* Gradence Wordmark */}
        <motion.h1 
          initial={{ opacity: 0, tracking: "0.2em" }}
          animate={{ opacity: 1, tracking: "0.05em" }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-3xl tracking-wider uppercase text-white font-odoo-slant font-bold text-center"
        >
          GRADENCE
        </motion.h1>

        {/* Subtle tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-xs text-neutral-400 font-mono mt-2"
        >
          offline academic companion
        </motion.p>
      </motion.div>

      {/* Progress line */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-48 h-[1px] bg-neutral-900 overflow-hidden">
        <motion.div 
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: 0 }}
          className="absolute top-0 bottom-0 w-1/2 bg-white/40"
        />
      </div>
    </div>
  );
}
