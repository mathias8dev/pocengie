"use client"
import React, { ReactNode, useEffect, useState } from 'react';
import { SmartAppBanner } from './SmartAppBanner';
import { useAndroidRedirectContext } from './AndroidRedirectProvider';
import { SmartBannerProps } from './types';

interface SmartRedirectWrapperProps {
  children: ReactNode;
  showBanner?: boolean;
  autoRedirect?: boolean;
  bannerProps?: Partial<SmartBannerProps>;
  customUrl?: string;
}

export const SmartRedirectWrapper: React.FC<SmartRedirectWrapperProps> = ({
  children,
  showBanner = true,
  autoRedirect = false,
  bannerProps,
  customUrl
}) => {
  const { redirectToApp, deviceInfo, checkAppInstalled } = useAndroidRedirectContext();
  const [showSmartBanner, setShowSmartBanner] = useState(false);
  const [appInstalled, setAppInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeRedirect = async () => {
      if (!deviceInfo?.isAndroid) return;

      const installed = await checkAppInstalled();
      setAppInstalled(installed);

      if (autoRedirect && installed) {
        redirectToApp(customUrl);
      } else if (showBanner) {
        setShowSmartBanner(true);
      }
    };

    initializeRedirect();
  }, [deviceInfo, checkAppInstalled, autoRedirect, showBanner, customUrl, redirectToApp,]);

  const handleBannerOpen = () => {
    redirectToApp(customUrl);
  };

  const handleBannerClose = () => {
    setShowSmartBanner(false);
  };

  return (
    <>
      {showSmartBanner && deviceInfo?.isAndroid && (
        <SmartAppBanner
          title={appInstalled ? 'Open in App' : 'Get the App'}
          description={
            appInstalled
              ? 'Continue in our mobile app for a better experience'
              : 'Download our app for the best experience'
          }
          buttonText={appInstalled ? 'Open App' : 'Get App'}
          onOpen={handleBannerOpen}
          onClose={handleBannerClose}
          {...bannerProps}
        />
      )}
      {children}
    </>
  );
};