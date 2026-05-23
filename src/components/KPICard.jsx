import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

const KPICard = ({ title, value, icon: Icon, suffix = '', prefix = '', decimals = 0, delay = 0, isVisible = true }) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const animatedValue = useCountUp(numericValue, 1000);

  // Formatar o valor final
  const displayValue = animatedValue.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <div 
      className={`kpi-card reveal ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="kpi-card-header">
        <span className="kpi-card-title">{title}</span>
        {Icon && <Icon className="kpi-card-icon" size={20} />}
      </div>
      <div className="kpi-card-value">
        <span className="kpi-prefix">{prefix}</span>
        {displayValue}
        <span className="kpi-suffix">{suffix}</span>
      </div>
    </div>
  );
};

export default KPICard;
