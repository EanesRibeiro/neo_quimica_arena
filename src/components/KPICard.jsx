import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

export function KPICard({ label, value, prefix='', suffix='', delay=0 }) {
  const animated = useCountUp(value, 1400, delay);
  const formatted = animated.toLocaleString('pt-BR');
  return (
    <div className='kpi-card'>
      <span className='kpi-value'>{prefix}{formatted}{suffix}</span>
      <span className='kpi-label'>{label}</span>
    </div>
  );
}

export default KPICard;
