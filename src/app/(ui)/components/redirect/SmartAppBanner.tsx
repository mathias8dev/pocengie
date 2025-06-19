"use client"

import React, { useEffect, useState } from 'react';
import { SmartBannerProps } from './types';



export const SmartAppBanner: React.FC<SmartBannerProps> = ({
  title = 'Open in App',
  description = 'Get a better experience with our mobile app',
  buttonText = 'Open App',
  onOpen,
  onClose,
  autoHide = true,
  autoHideDelay = 60000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleOpen = () => {
    onOpen?.();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#000',
      color: 'white',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{title}</div>
        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
          {description}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleOpen}
          style={{
            background: '#007AFF',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {buttonText}
        </button>
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};