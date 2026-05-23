import { useState, useEffect } from 'react';

/**
 * Hook customizado para contagem progressiva numérica suave.
 * @param {number} endValue - O valor final da contagem.
 * @param {number} duration - Duração da animação em milissegundos.
 * @returns {number} O valor atual da contagem animada.
 */
export function useCountUp(endValue, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(endValue);
    if (isNaN(end)) return;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMilliseconds = duration;
    const frameRate = 1000 / 60; // ~60 FPS
    const totalFrames = Math.max(Math.floor(totalMilliseconds / frameRate), 1);
    
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Easing out quad: progress * (2 - progress)
      const easeProgress = progress * (2 - progress);
      const currentValue = start + easeProgress * (end - start);
      
      setCount(currentValue);

      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [endValue, duration]);

  return count;
}
