"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { AppRedirectConfig, DeviceInfo } from './types';

export const useAndroidRedirect = (config: AppRedirectConfig) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean | null>(null);

  // Detect device info
  useEffect(() => {
    const userAgent = navigator.userAgent || '';

    setDeviceInfo({
      isAndroid: /Android/i.test(userAgent),
      isChrome: /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent),
      userAgent
    });
  }, []);

  // Check if app is installed
  const checkAppInstalled = useCallback(async (): Promise<boolean> => {
    if (!deviceInfo?.isAndroid) return false;

    return new Promise((resolve) => {
      const testUrl = `${config.scheme}://test`;
      const startTime = Date.now();

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = testUrl;
      document.body.appendChild(iframe);

      const handleVisibilityChange = () => {
        if (document.hidden || (document as any).webkitHidden) {
          resolve(true);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('webkitvisibilitychange', handleVisibilityChange);

      setTimeout(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('webkitvisibilitychange', handleVisibilityChange);
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        resolve(Date.now() - startTime > 2000);
      }, 3000);
    });
  }, [config.scheme, deviceInfo]);

  // Create intent URL
  const createIntentUrl = useCallback((targetUrl: string): string => {
    const playStoreFallback = config.playStoreUrl
      ? `S.browser_fallback_url=${encodeURIComponent(config.playStoreUrl)};`
      : '';
    const urlObj = new URL(targetUrl);
    const pathAndQuery = urlObj.pathname + urlObj.search + urlObj.hash;
    return `intent://${urlObj.host}${pathAndQuery}#Intent;scheme=https;package=${config.packageName};${playStoreFallback}end`;
  }, [config]);

  // Create custom scheme URL
  const createCustomSchemeUrl = useCallback((targetUrl: string): string => {
    const encodedUrl = encodeURIComponent(targetUrl);
    return `${config.scheme}://open?url=${encodedUrl}`;
  }, [config.scheme]);

  // Main redirect function
  const redirectToApp = useCallback((customUrl?: string): boolean => {
    if (!deviceInfo?.isAndroid) {
      console.log('Not on Android device, skipping app redirect');
      return false;
    }

    const targetUrl = customUrl || window.location.href;
    const intentUrl = createIntentUrl(targetUrl);
    const customSchemeUrl = createCustomSchemeUrl(targetUrl);

    console.log('Attempting to open app with URL:', targetUrl);

    try {
      if (deviceInfo.isChrome) {
        window.location.href = intentUrl;
      } else {
        window.location.href = customSchemeUrl;
      }

      // Handle fallback
      if (config.playStoreUrl) {
        setTimeout(() => {
          if (!document.hidden) {
            window.location.href = config.playStoreUrl!;
          }
        }, config.fallbackDelay || 2000);
      }

      return true;
    } catch (error) {
      console.warn('Failed to open app:', error);
      return false;
    }
  }, [deviceInfo, createIntentUrl, createCustomSchemeUrl, config]);

  return {
    deviceInfo,
    isAppInstalled,
    checkAppInstalled,
    redirectToApp,
    setIsAppInstalled
  };
};