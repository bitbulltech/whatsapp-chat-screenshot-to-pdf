"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const window_1 = require("./window");
const config_1 = require("./config");
const screenshot_1 = require("./screenshot");
const scroll_1 = require("./scroll");
const windowDetector_1 = require("./windowDetector");
const pdfGenerator_1 = require("./pdfGenerator");
let captureStatus = 'ready';
let captureCount = 0;
let isPaused = false;
// Handle app ready
electron_1.app.whenReady().then(() => {
    (0, window_1.createWindow)();
    electron_1.app.on('activate', () => {
        if ((0, window_1.createWindow)() === null) {
            (0, window_1.createWindow)();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC Handlers
electron_1.ipcMain.handle('get-config', async () => {
    return config_1.config.get();
});
electron_1.ipcMain.handle('set-capture-area', async (_event, area) => {
    config_1.config.setCaptureArea(area);
});
electron_1.ipcMain.handle('set-settings', async (_event, settings) => {
    config_1.config.setSettings(settings);
});
electron_1.ipcMain.handle('get-status', async () => {
    return captureStatus;
});
electron_1.ipcMain.handle('get-capture-count', async () => {
    return (0, screenshot_1.getCounter)();
});
electron_1.ipcMain.handle('start-capture', async () => {
    if (captureStatus === 'capturing') {
        throw new Error('Capture is already running');
    }
    const appConfig = config_1.config.get();
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
    (0, screenshot_1.resetCounter)();
    const mainWindow = (0, window_1.getWindow)();
    if (mainWindow) {
        mainWindow.webContents.send('status-change', captureStatus);
    }
    // Start capture loop
    startCaptureLoop(appConfig);
});
const startCaptureLoop = async (appConfig) => {
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
            const filePath = await (0, screenshot_1.captureScreenshot)(appConfig.captureArea, appConfig.settings.outputFolder, appConfig.settings.fileNamePattern);
            captureCount = (0, screenshot_1.getCounter)();
            // Notify renderer
            const mainWindow = (0, window_1.getWindow)();
            if (mainWindow) {
                mainWindow.webContents.send('capture-complete', filePath);
                mainWindow.webContents.send('status-change', captureStatus);
            }
            // Scroll
            await (0, scroll_1.scrollChat)(appConfig.settings.scrollDirection, appConfig.settings.scrollAmount);
            // Wait a bit after scroll before next capture
            await new Promise(resolve => setTimeout(resolve, 500));
            // Continue loop if still capturing
            if (captureStatus === 'capturing' && !isPaused) {
                captureLoop();
            }
        }
        catch (error) {
            const mainWindow = (0, window_1.getWindow)();
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
electron_1.ipcMain.handle('stop-capture', async () => {
    console.log('[Main] Stop capture called');
    captureStatus = 'stopped';
    isPaused = false;
    const mainWindow = (0, window_1.getWindow)();
    if (mainWindow) {
        mainWindow.webContents.send('status-change', captureStatus);
    }
    // Generate PDF if enabled
    const appConfig = config_1.config.get();
    console.log('[Main] PDF generation check', {
        generatePdf: appConfig.settings.generatePdf,
        outputFolder: appConfig.settings.outputFolder,
        pdfOrder: appConfig.settings.pdfOrder,
    });
    if (appConfig.settings.generatePdf && appConfig.settings.outputFolder) {
        console.log('[Main] Starting PDF generation...');
        try {
            const mainWindow = (0, window_1.getWindow)();
            if (mainWindow) {
                mainWindow.webContents.send('pdf-generation-started');
            }
            console.log('[Main] Calling generatePdf with:', {
                outputFolder: appConfig.settings.outputFolder,
                fileNamePattern: appConfig.settings.fileNamePattern,
                pdfOrder: appConfig.settings.pdfOrder,
            });
            const pdfPath = await (0, pdfGenerator_1.generatePdf)(appConfig.settings.outputFolder, appConfig.settings.fileNamePattern, appConfig.settings.pdfOrder || 'asc');
            console.log('[Main] PDF generated successfully:', pdfPath);
            if (mainWindow) {
                mainWindow.webContents.send('pdf-generation-complete', pdfPath);
            }
        }
        catch (error) {
            console.error('[Main] PDF generation failed:', error);
            const mainWindow = (0, window_1.getWindow)();
            if (mainWindow) {
                mainWindow.webContents.send('pdf-generation-error', error.message);
            }
        }
    }
    else {
        console.log('[Main] PDF generation skipped:', {
            generatePdf: appConfig.settings.generatePdf,
            hasOutputFolder: !!appConfig.settings.outputFolder,
        });
    }
});
electron_1.ipcMain.handle('pause-capture', async () => {
    if (captureStatus === 'capturing') {
        captureStatus = 'paused';
        isPaused = true;
        const mainWindow = (0, window_1.getWindow)();
        if (mainWindow) {
            mainWindow.webContents.send('status-change', captureStatus);
        }
    }
});
electron_1.ipcMain.handle('resume-capture', async () => {
    if (captureStatus === 'paused') {
        captureStatus = 'capturing';
        isPaused = false;
        const mainWindow = (0, window_1.getWindow)();
        if (mainWindow) {
            mainWindow.webContents.send('status-change', captureStatus);
        }
        // Resume capture loop
        const appConfig = config_1.config.get();
        startCaptureLoop(appConfig);
    }
});
electron_1.ipcMain.handle('detect-chrome-window', async () => {
    try {
        const isActive = await (0, windowDetector_1.isWhatsAppWebActive)();
        return isActive;
    }
    catch (error) {
        console.error('Error detecting Chrome window:', error);
        return false;
    }
});
electron_1.ipcMain.handle('select-output-folder', async () => {
    const result = await electron_1.dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});
electron_1.ipcMain.handle('set-window-opacity', async (_event, opacity) => {
    (0, window_1.setWindowOpacity)(opacity);
});
electron_1.ipcMain.handle('get-window-bounds', async () => {
    const mainWindow = (0, window_1.getWindow)();
    if (mainWindow) {
        const bounds = mainWindow.getBounds();
        return bounds;
    }
    return { x: 0, y: 0, width: 0, height: 0 };
});
electron_1.ipcMain.handle('get-screen-size', async () => {
    const primaryDisplay = electron_1.screen.getPrimaryDisplay();
    return {
        width: primaryDisplay.size.width,
        height: primaryDisplay.size.height,
        scaleFactor: primaryDisplay.scaleFactor,
    };
});
