"use client"
import React from 'react';
import { useAndroidRedirectContext } from './AndroidRedirectProvider';

interface AppRedirectButtonProps {
  customUrl?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'primary' | 'secondary' | 'custom';
  disabled?: boolean;
  onClick?: () => void;
}

export const AppRedirectButton: React.FC<AppRedirectButtonProps> = ({
  customUrl,
  children = 'Open in App',
  className,
  style,
  variant = 'primary',
  disabled = false,
  onClick
}) => {
  const { redirectToApp, deviceInfo } = useAndroidRedirectContext();

  const handleClick = () => {
    onClick?.();
    redirectToApp(customUrl);
  };

  // Don't render on non-Android devices
  if (!deviceInfo?.isAndroid) {
    return null;
  }

  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: '#007AFF',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        };
      case 'secondary':
        return {
          background: 'transparent',
          color: '#007AFF',
          border: '2px solid #007AFF',
          padding: '10px 22px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        };
      default:
        return {};
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={className}
      style={{
        ...getVariantStyle(),
        ...style
      }}
    >
      {children}
    </button>
  );
};