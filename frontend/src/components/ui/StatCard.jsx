import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

export default function StatCard({ title, value, icon: Icon, gradient, suffix = '', prefix = '', description }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (numericValue === 0) {
      setDisplayValue(0);
      return;
    }

    animated.current = true;
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numericValue);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(numericValue);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  const gradientClass = gradient || 'from-blue-500 to-blue-600';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradientClass} p-5 text-white shadow-lg cursor-default`}
    >
      {/* Background icon decoration */}
      {Icon && (
        <div className="absolute top-3 right-3 opacity-20">
          <Icon className="w-12 h-12" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
        <p className="text-3xl font-bold tracking-tight">
          {prefix}
          {displayValue.toLocaleString()}
          {suffix}
        </p>
        {description && (
          <p className="text-xs text-white/60 mt-2">{description}</p>
        )}
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
    </motion.div>
  );
}
