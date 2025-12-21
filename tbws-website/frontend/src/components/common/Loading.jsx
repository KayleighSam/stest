import React from 'react';
import './Loading.css';

const Loading = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          <div className={`spinner ${sizeClasses[size]}`}></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={`spinner ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Loading;