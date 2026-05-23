import React from 'react';

/**
 * Gauge Semicircular Responsivo baseado em SVG puro e CSS.
 * Cores baseadas nos critérios do Corinthians (sem verde!).
 */
const ProbabilityGauge = ({ probability }) => {
  const value = Math.min(Math.max(probability, 0), 100);
  
  // Raio e perímetro do semicírculo (SVG stroke-dasharray)
  const radius = 50;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // ~157.08
  const strokeDashoffset = circumference - (value / 100) * circumference;

  // Lógica de cores baseada nos limites
  let strokeColor = '#2E2E2E'; // Preto/cinza escuro para < 40%
  if (value >= 60) {
    strokeColor = '#C8232C'; // Vermelho Corinthians
  } else if (value >= 40) {
    strokeColor = '#E0E0E0'; // Cinza claro/branco para equilíbrio (40% - 59.9%)
  }

  return (
    <div className="gauge-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
      <svg width="220" height="120" viewBox="0 0 120 70">
        {/* Arco de fundo (Track) */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="#1F1F1F"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Arco de progresso */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease' }}
        />
        {/* Texto centralizado */}
        <text x="60" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="16" fontWeight="bold">
          {value.toFixed(1)}%
        </text>
        <text x="60" y="67" textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontWeight="bold">
          VITÓRIA
        </text>
      </svg>
    </div>
  );
};

export default ProbabilityGauge;
