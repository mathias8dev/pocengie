export interface AppRedirectConfig {
  packageName: string;
  scheme: string;
  playStoreUrl?: string;
  fallbackDelay?: number;
}

export interface DeviceInfo {
  isAndroid: boolean;
  isChrome: boolean;
  userAgent: string;
}


export interface SmartBannerProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onOpen?: () => void;
  onClose?: () => void;
  customUrl?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}