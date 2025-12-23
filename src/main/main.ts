import { app, ipcMain, dialog, screen } from 'electron';
import { createWindow, getWindow, setWindowOpacity } from './window';
import { config } from './config';
import { AppConfig, CaptureStatus } from '../shared/types';
import { captureScreenshot, resetCounter, getCounter } from './screenshot';
import { scrollChat } from './scroll';
import { isWhatsAppWebActive } from './windowDetector';
import { generatePdf } from './pdfGenerator';

let captureStatus: CaptureStatus = 'ready';
let captureCount = 0;
let isPaused = false;

// Handle app ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (createWindow() === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-config', async (): Promise<AppConfig> => {
  return config.get();
});

ipcMain.handle('set-capture-area', async (_event, area) => {
  config.setCaptureArea(area);
});

ipcMain.handle('set-settings', async (_event, settings) => {
  config.setSettings(settings);
});

ipcMain.handle('get-status', async (): Promise<CaptureStatus> => {
  return captureStatus;
});

ipcMain.handle('get-capture-count', async (): Promise<number> => {
  return getCounter();
});

ipcMain.handle('start-capture', async () => {
  if (captureStatus === 'capturing') {
    throw new Error('Capture is already running');
  }

  const appConfig = config.get();
  
  // Validate configuration
  if (!appConfig.captureArea || appConfig.captureArea.width === 0 || appConfig.captureArea.height === 0) {
    throw new Error('Please select a capture area first');
  }

  if (!appConfig.settings.outputFolder) {
    throw new Error('Please select an output folder');
  }

  captureStatus = 'capturing';
  captureCount = 0;
  isPaused = false;
  resetCounter();

  const mainWindow = getWindow();
  if (mainWindow) {
    mainWindow.webContents.send('status-change', captureStatus);
  }

  // Start capture loop
  startCaptureLoop(appConfig);
});

const startCaptureLoop = async (appConfig: AppConfig) => {
  const captureLoop = async () => {
    if (captureStatus !== 'capturing' || isPaused) {
      return;
    }

    try {
      // Check if Chrome/WhatsApp Web is available (optional check)
      // For now, we'll proceed anyway and let errors be handled

      // Wait for hold time
      await new Promise(resolve => setTimeout(resolve, appConfig.settings.holdTime * 1000));

      if (captureStatus !== 'capturing' || isPaused) {
        return;
      }

      // Capture screenshot
      const filePath = await captureScreenshot(
        appConfig.captureArea,
        appConfig.settings.outputFolder,
        appConfig.settings.fileNamePattern
      );

      captureCount = getCounter();
      
      // Notify renderer
      const mainWindow = getWindow();
      if (mainWindow) {
        mainWindow.webContents.send('capture-complete', filePath);
        mainWindow.webContents.send('status-change', captureStatus);
      }

      // Scroll
      await scrollChat(
        appConfig.settings.scrollDirection,
        appConfig.settings.scrollAmount
      );

      // Wait a bit after scroll before next capture
      await new Promise(resolve => setTimeout(resolve, 500));

      // Continue loop if still capturing
      if (captureStatus === 'capturing' && !isPaused) {
        captureLoop();
      }
    } catch (error) {
      const mainWindow = getWindow();
      if (mainWindow) {
        mainWindow.webContents.send('capture-error', error instanceof Error ? error.message : String(error));
      }
      captureStatus = 'stopped';
      if (mainWindow) {
        mainWindow.webContents.send('status-change', captureStatus);
      }
    }
  };

  // Start the loop
  captureLoop();
};

ipcMain.handle('stop-capture', async () => {
  console.log('[Main] Stop capture called');
  captureStatus = 'stopped';
  isPaused = false;
  
  const mainWindow = getWindow();
  if (mainWindow) {
    mainWindow.webContents.send('status-change', captureStatus);
  }

  // Generate PDF if enabled
  const appConfig = config.get();
  console.log('[Main] PDF generation check', {
    generatePdf: appConfig.settings.generatePdf,
    outputFolder: appConfig.settings.outputFolder,
    pdfOrder: appConfig.settings.pdfOrder,
  });

  if (appConfig.settings.generatePdf && appConfig.settings.outputFolder) {
    console.log('[Main] Starting PDF generation...');
    try {
      const mainWindow = getWindow();
      if (mainWindow) {
        mainWindow.webContents.send('pdf-generation-started');
      }

      console.log('[Main] Calling generatePdf with:', {
        outputFolder: appConfig.settings.outputFolder,
        fileNamePattern: appConfig.settings.fileNamePattern,
        pdfOrder: appConfig.settings.pdfOrder,
      });

      const pdfPath = await generatePdf(
        appConfig.settings.outputFolder,
        appConfig.settings.fileNamePattern,
        appConfig.settings.pdfOrder || 'asc'
      );

      console.log('[Main] PDF generated successfully:', pdfPath);

      if (mainWindow) {
        mainWindow.webContents.send('pdf-generation-complete', pdfPath);
      }
    } catch (error: any) {
      console.error('[Main] PDF generation failed:', error);
      const mainWindow = getWindow();
      if (mainWindow) {
        mainWindow.webContents.send('pdf-generation-error', error.message);
      }
    }
  } else {
    console.log('[Main] PDF generation skipped:', {
      generatePdf: appConfig.settings.generatePdf,
      hasOutputFolder: !!appConfig.settings.outputFolder,
    });
  }
});

ipcMain.handle('pause-capture', async () => {
  if (captureStatus === 'capturing') {
    captureStatus = 'paused';
    isPaused = true;
    const mainWindow = getWindow();
    if (mainWindow) {
      mainWindow.webContents.send('status-change', captureStatus);
    }
  }
});

ipcMain.handle('resume-capture', async () => {
  if (captureStatus === 'paused') {
    captureStatus = 'capturing';
    isPaused = false;
    const mainWindow = getWindow();
    if (mainWindow) {
      mainWindow.webContents.send('status-change', captureStatus);
    }
    // Resume capture loop
    const appConfig = config.get();
    startCaptureLoop(appConfig);
  }
});

ipcMain.handle('detect-chrome-window', async (): Promise<boolean> => {
  try {
    const isActive = await isWhatsAppWebActive();
    return isActive;
  } catch (error) {
    console.error('Error detecting Chrome window:', error);
    return false;
  }
});

ipcMain.handle('select-output-folder', async (): Promise<string | null> => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('set-window-opacity', async (_event, opacity: number) => {
  setWindowOpacity(opacity);
});

ipcMain.handle('get-window-bounds', async () => {
  const mainWindow = getWindow();
  if (mainWindow) {
    const bounds = mainWindow.getBounds();
    return bounds;
  }
  return { x: 0, y: 0, width: 0, height: 0 };
});

ipcMain.handle('get-screen-size', async () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return {
    width: primaryDisplay.size.width,
    height: primaryDisplay.size.height,
    scaleFactor: primaryDisplay.scaleFactor,
  };
});

