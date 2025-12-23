"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Config methods
    getConfig: () => electron_1.ipcRenderer.invoke('get-config'),
    setCaptureArea: (area) => electron_1.ipcRenderer.invoke('set-capture-area', area),
    setSettings: (settings) => electron_1.ipcRenderer.invoke('set-settings', settings),
    // Capture control
    startCapture: () => electron_1.ipcRenderer.invoke('start-capture'),
    stopCapture: () => electron_1.ipcRenderer.invoke('stop-capture'),
    pauseCapture: () => electron_1.ipcRenderer.invoke('pause-capture'),
    resumeCapture: () => electron_1.ipcRenderer.invoke('resume-capture'),
    // Status
    getStatus: () => electron_1.ipcRenderer.invoke('get-status'),
    getCaptureCount: () => electron_1.ipcRenderer.invoke('get-capture-count'),
    // Events
    onStatusChange: (callback) => {
        electron_1.ipcRenderer.on('status-change', (_event, status) => callback(status));
    },
    onCaptureComplete: (callback) => {
        electron_1.ipcRenderer.on('capture-complete', (_event, filePath) => callback(filePath));
    },
    onError: (callback) => {
        electron_1.ipcRenderer.on('capture-error', (_event, error) => callback(error));
    },
    // Window detection
    detectChromeWindow: () => electron_1.ipcRenderer.invoke('detect-chrome-window'),
    // File dialog
    selectOutputFolder: () => electron_1.ipcRenderer.invoke('select-output-folder'),
    // Window opacity
    setWindowOpacity: (opacity) => electron_1.ipcRenderer.invoke('set-window-opacity', opacity),
    // Get window bounds (for coordinate conversion)
    getWindowBounds: () => electron_1.ipcRenderer.invoke('get-window-bounds'),
    // Get screen size (for coordinate validation)
    getScreenSize: () => electron_1.ipcRenderer.invoke('get-screen-size'),
    // PDF generation events
    onPdfGenerationStarted: (callback) => {
        electron_1.ipcRenderer.on('pdf-generation-started', () => callback());
    },
    onPdfGenerationComplete: (callback) => {
        electron_1.ipcRenderer.on('pdf-generation-complete', (_event, filePath) => callback(filePath));
    },
    onPdfGenerationError: (callback) => {
        electron_1.ipcRenderer.on('pdf-generation-error', (_event, error) => callback(error));
    },
});
