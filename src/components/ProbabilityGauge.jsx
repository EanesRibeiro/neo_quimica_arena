import React, { useEffect, useRef } from 'react';

const COR_GAUGE = (prob) => {
  if (prob >= 60) return '#C8232C'; // Vermelho Corinthians
  if (prob >= 40) return '#888888'; // Cinza Empates
  return '#2E2E2E';                 // Cinza Escuro Derrota
};

export function ProbabilityGauge({ probability, sampleSize }) {
  const prevRef = useRef(0);
  const frameRef = useRef(null);
  const pathRef = useRef(null);
  const textRef = useRef(null);

  const RADIUS = 80;
  const CIRCUMFERENCE = Math.PI * RADIUS;

  useEffect(() => {
    const start = prevRef.current;
    const end = probability;
    const duration = 800;
    const startTime = performance.now();
    const cor = COR_GAUGE(probability);

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic easeOut
      const current = start + (end - start) * eased;

      const dashOffset = CIRCUMFERENCE * (1 - current / 100);

      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = dashOffset;
        pathRef.current.setAttribute('stroke', cor);
      }
      if (textRef.current) {
        textRef.current.textContent = Math.round(current) + '%';
        textRef.current.setAttribute('fill', cor);
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [probability, CIRCUMFERENCE]);

  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <svg viewBox="0 0 200 110" width="240" height="130">
        {/* Track de fundo */}
        <path 
          d="M 10 100 A 90 90 0 0 1 190 100" 
          fill="none" 
          stroke="#1E1E1E" 
          strokeWidth="14" 
          strokeLinecap="round" 
        />
        {/* Arco de progresso ativo */}
        <path 
          ref={pathRef}
          d="M 10 100 A 90 90 0 0 1 190 100" 
          fill="none" 
          stroke="#888888" 
          strokeWidth="14" 
          strokeLinecap="round" 
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
        {/* Texto central */}
        <text 
          ref={textRef} 
          x="100" 
          y="88" 
          textAnchor="middle" 
          fontSize="32" 
          fontWeight="900" 
          fontFamily="'Barlow Condensed', sans-serif"
          fill="#888888"
        >
          0%
        </text>
        <text 
          x="100" 
          y="108" 
          textAnchor="middle" 
          fontSize="10" 
          fill="#595959" 
          fontFamily="'Barlow', sans-serif"
        >
          {sampleSize >= 5 ? `Base: ${sampleSize} jogos` : 'Naive Bayes (Amostra Reduzida < 5)'}
        </text>
      </svg>
    </div>
  );
}

export default ProbabilityGauge;
