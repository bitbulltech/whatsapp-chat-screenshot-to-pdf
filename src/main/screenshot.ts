import screenshot from 'screenshot-desktop';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { CaptureArea } from '../shared/types';
import sharp from 'sharp';
import { screen } from 'electron';

let captureCounter = 0;

export const captureScreenshot = async (
  area: CaptureArea,
  outputFolder: string,
  fileNamePattern: string
): Promise<string> => {
  const log = (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Screenshot] ${message}`, ...args);
  };
  
  try {
    log('Starting screenshot capture', { area, outputFolder });
    
    // Ensure output folder exists
    if (!existsSync(outputFolder)) {
      await mkdir(outputFolder, { recursive: true });
      log('Created output folder', outputFolder);
    }

    // Get screen info for DPI scaling
    const primaryDisplay = screen.getPrimaryDisplay();
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
    const imgBuffer = await screenshot();

    // Get image metadata first
    const metadata = await sharp(imgBuffer).metadata();
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
    const cropped = await sharp(imgBuffer)
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
    const filePath = join(outputFolder, fileName);

    // Save file
    log('Saving file', filePath);
    await writeFile(filePath, cropped);
    log('Screenshot saved successfully', filePath);

    return filePath;
  } catch (error: any) {
    log('Screenshot error', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to capture screenshot: ${error.message}`);
  }
};

export const resetCounter = (): void => {
  captureCounter = 0;
};

export const getCounter = (): number => {
  return captureCounter;
};

