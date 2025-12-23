import { contextBridge, ipcRenderer } from 'electron';
import { AppConfig, CaptureArea, CaptureStatus } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  // Config methods
  getConfig: (): Promise<AppConfig> => ipcRenderer.invoke('get-config'),
  setCaptureArea: (area: CaptureArea): Promise<void> =>
    ipcRenderer.invoke('set-capture-area', area),
  setSettings: (settings: Partial<AppConfig['settings']>): Promise<void> =>
    ipcRenderer.invoke('set-settings', settings),

  // Capture control
  startCapture: (): Promise<void> => ipcRenderer.invoke('start-capture'),
  stopCapture: (): Promise<void> => ipcRenderer.invoke('stop-capture'),
  pauseCapture: (): Promise<void> => ipcRenderer.invoke('pause-capture'),
  resumeCapture: (): Promise<void> => ipcRenderer.invoke('resume-capture'),

  // Status
  getStatus: (): Promise<CaptureStatus> => ipcRenderer.invoke('get-status'),
  getCaptureCount: (): Promise<number> => ipcRenderer.invoke('get-capture-count'),

  // Events
  onStatusChange: (callback: (status: CaptureStatus) => void) => {
    ipcRenderer.on('status-change', (_event, status) => callback(status));
  },
  onCaptureComplete: (callback: (filePath: string) => void) => {
    ipcRenderer.on('capture-complete', (_event, filePath) => callback(filePath));
  },
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('capture-error', (_event, error) => callback(error));
  },

  // Window detection
  detectChromeWindow: (): Promise<boolean> =>
    ipcRenderer.invoke('detect-chrome-window'),

  // File dialog
  selectOutputFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('select-output-folder'),

  // Window opacity
  setWindowOpacity: (opacity: number): Promise<void> =>
    ipcRenderer.invoke('set-window-opacity', opacity),

  // Get window bounds (for coordinate conversion)
  getWindowBounds: (): Promise<{ x: number; y: number; width: number; height: number }> =>
    ipcRenderer.invoke('get-window-bounds'),

  // Get screen size (for coordinate validation)
  getScreenSize: (): Promise<{ width: number; height: number; scaleFactor: number }> =>
    ipcRenderer.invoke('get-screen-size'),

  // PDF generation events
  onPdfGenerationStarted: (callback: () => void) => {
    ipcRenderer.on('pdf-generation-started', () => callback());
  },
  onPdfGenerationComplete: (callback: (filePath: string) => void) => {
    ipcRenderer.on('pdf-generation-complete', (_event, filePath) => callback(filePath));
  },
  onPdfGenerationError: (callback: (error: string) => void) => {
    ipcRenderer.on('pdf-generation-error', (_event, error) => callback(error));
  },
});

