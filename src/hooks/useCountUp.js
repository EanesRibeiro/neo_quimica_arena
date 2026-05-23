import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = performance.now();
      
      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: easeOutQuart
        const eased = 1 - Math.pow(1 - progress, 4);
        
        setValue(Math.round(eased * target));
        
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        }
      };
      
      frameRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, delay]);

  return value;
}
