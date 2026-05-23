import React from 'react';

export function SkeletonCard({ type = 'card', height = '120px' }) {
  if (type === 'chart') {
    return (
      <div className="skeleton-container skeleton-chart" style={{ height }}>
        <div className="skeleton-bar-chart">
          <div className="skeleton-bar" style={{ height: '30%' }}></div>
          <div className="skeleton-bar" style={{ height: '60%' }}></div>
          <div className="skeleton-bar" style={{ height: '45%' }}></div>
          <div className="skeleton-bar" style={{ height: '80%' }}></div>
          <div className="skeleton-bar" style={{ height: '50%' }}></div>
          <div className="skeleton-bar" style={{ height: '70%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-card" style={{ height }}>
      <div className="skeleton-title"></div>
      <div className="skeleton-value"></div>
    </div>
  );
}

export default SkeletonCard;
