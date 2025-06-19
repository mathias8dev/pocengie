"use client"
import { createContext, useContext, ReactNode } from 'react';
import { AppRedirectConfig } from './types';
import { useAndroidRedirect } from './useAndroidRedirect';

interface AndroidRedirectContextType {
  redirectToApp: (customUrl?: string) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deviceInfo: any;
  isAppInstalled: boolean | null;
  checkAppInstalled: () => Promise<boolean>;
}

const AndroidRedirectContext = createContext<AndroidRedirectContextType | undefined>(undefined);

interface AndroidRedirectProviderProps {
  children: ReactNode;
  config: AppRedirectConfig;
}

export const AndroidRedirectProvider: React.FC<AndroidRedirectProviderProps> = ({
  children,
  config
}) => {
  const redirectHook = useAndroidRedirect(config);

  return (
    <AndroidRedirectContext.Provider value={redirectHook}>
      {children}
    </AndroidRedirectContext.Provider>
  );
};

export const useAndroidRedirectContext = () => {
  const context = useContext(AndroidRedirectContext);
  if (context === undefined) {
    throw new Error('useAndroidRedirectContext must be used within an AndroidRedirectProvider');
  }
  return context;
};
