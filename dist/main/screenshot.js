"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCounter = exports.resetCounter = exports.captureScreenshot = void 0;
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const sharp_1 = __importDefault(require("sharp"));
const electron_1 = require("electron");
let captureCounter = 0;
const captureScreenshot = async (area, outputFolder, fileNamePattern) => {
    const log = (message, ...args) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [Screenshot] ${message}`, ...args);
    };
    try {
        log('Starting screenshot capture', { area, outputFolder });
        // Ensure output folder exists
        if (!(0, fs_1.existsSync)(outputFolder)) {
            await (0, promises_1.mkdir)(outputFolder, { recursive: true });
            log('Created output folder', outputFolder);
        }
        // Get screen info for DPI scaling
        const primaryDisplay = electron_1.screen.getPrimaryDisplay();
        const scaleFactor = primaryDisplay.scaleFactor;
        const screenSize = primaryDisplay.size;
        const bounds = primaryDisplay.bounds;
        log('Display info', {
            scaleFactor,
            screenSize: { width: screenSize.width, height: screenSize.height },
            bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
            requestedArea: area,
        });
        // Capture full screen (returns Buffer)
        log('Capturing screenshot...');
        const imgBuffer = await (0, screenshot_desktop_1.default)();
        // Get image metadata first
        const metadata = await (0, sharp_1.default)(imgBuffer).metadata();
        const imgWidth = metadata.width || 1920;
        const imgHeight = metadata.height || 1080;
        log('Screenshot captured', {
            imgWidth,
            imgHeight,
            scaleFactor,
            screenLogicalSize: { width: screenSize.width, height: screenSize.height },
        });
        // Calculate the ratio between screenshot dimensions and logical screen size
        // This tells us how screenshot-desktop handles scaling
        const widthRatio = imgWidth / screenSize.width;
        const heightRatio = imgHeight / screenSize.height;
        log('Scaling ratios', {
            widthRatio,
            heightRatio,
            note: 'If ratio > 1, screenshot is at higher resolution (DPI scaled). If ratio = 1, screenshot matches logical size.',
        });
        // screenshot-desktop typically returns physical pixels (actual resolution)
        // Area coordinates are in logical pixels (Windows scaled coordinates)
        // We need to convert logical pixels to match screenshot resolution
        // If screenshot is at 1.2x resolution (120% DPI), we multiply by the ratio
        const screenshotX = Math.round(area.x * widthRatio);
        const screenshotY = Math.round(area.y * heightRatio);
        const screenshotWidth = Math.round(area.width * widthRatio);
        const screenshotHeight = Math.round(area.height * heightRatio);
        log('Converted coordinates', {
            logical: { x: area.x, y: area.y, width: area.width, height: area.height },
            screenshot: { x: screenshotX, y: screenshotY, width: screenshotWidth, height: screenshotHeight },
            ratios: { widthRatio, heightRatio },
        });
        // Calculate safe crop bounds (ensure they're within screenshot dimensions)
        const left = Math.max(0, Math.min(screenshotX, imgWidth - 1));
        const top = Math.max(0, Math.min(screenshotY, imgHeight - 1));
        const maxWidth = imgWidth - left;
        const maxHeight = imgHeight - top;
        const width = Math.max(1, Math.min(screenshotWidth, maxWidth));
        const height = Math.max(1, Math.min(screenshotHeight, maxHeight));
        log('Final crop bounds', {
            left,
            top,
            width,
            height,
            imgDimensions: { imgWidth, imgHeight },
            validation: {
                leftValid: left >= 0 && left < imgWidth,
                topValid: top >= 0 && top < imgHeight,
                widthValid: width > 0 && (left + width) <= imgWidth,
                heightValid: height > 0 && (top + height) <= imgHeight,
            },
        });
        // Crop to selected area using sharp
        log('Cropping image...');
        const cropped = await (0, sharp_1.default)(imgBuffer)
            .extract({
            left,
            top,
            width,
            height,
        })
            .png()
            .toBuffer();
        // Generate filename
        captureCounter++;
        const fileName = fileNamePattern.replace('{number}', captureCounter.toString().padStart(3, '0'));
        const filePath = (0, path_1.join)(outputFolder, fileName);
        // Save file
        log('Saving file', filePath);
        await (0, promises_1.writeFile)(filePath, cropped);
        log('Screenshot saved successfully', filePath);
        return filePath;
    }
    catch (error) {
        log('Screenshot error', {
            error: error.message,
            stack: error.stack,
        });
        throw new Error(`Failed to capture screenshot: ${error.message}`);
    }
};
exports.captureScreenshot = captureScreenshot;
const resetCounter = () => {
    captureCounter = 0;
};
exports.resetCounter = resetCounter;
const getCounter = () => {
    return captureCounter;
};
exports.getCounter = getCounter;
