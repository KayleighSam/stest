import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ title, value, change, icon: Icon, color = '#ff6b35' }) => {
  const isPositive = change >= 0;

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        <div className="stat-card-icon" style={{ background: `${color}20`, color }}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {change !== undefined && (
          <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;