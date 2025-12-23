import { AppConfig, CaptureStatus, CaptureArea } from '../shared/types';

export interface ElectronAPI {
  // Config methods
  getConfig: () => Promise<AppConfig>;
  setCaptureArea: (area: CaptureArea) => Promise<void>;
  setSettings: (settings: Partial<AppConfig['settings']>) => Promise<void>;

  // Capture control
  startCapture: () => Promise<void>;
  stopCapture: () => Promise<void>;
  pauseCapture: () => Promise<void>;
  resumeCapture: () => Promise<void>;

  // Status
  getStatus: () => Promise<CaptureStatus>;
  getCaptureCount: () => Promise<number>;

  // Events
  onStatusChange: (callback: (status: CaptureStatus) => void) => void;
  onCaptureComplete: (callback: (filePath: string) => void) => void;
  onError: (callback: (error: string) => void) => void;

  // Window detection
  detectChromeWindow: () => Promise<boolean>;

  // File dialog
  selectOutputFolder: () => Promise<string | null>;

  // Window opacity
  setWindowOpacity: (opacity: number) => Promise<void>;

  // Get window bounds
  getWindowBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;

  // Get screen size
  getScreenSize: () => Promise<{ width: number; height: number; scaleFactor: number }>;

  // PDF generation events
  onPdfGenerationStarted: (callback: () => void) => void;
  onPdfGenerationComplete: (callback: (filePath: string) => void) => void;
  onPdfGenerationError: (callback: (error: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

