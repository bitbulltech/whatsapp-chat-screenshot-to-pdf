import PDFDocument from 'pdfkit';
import { readFileSync, readdirSync, statSync, createWriteStream } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

export const generatePdf = async (
  outputFolder: string,
  fileNamePattern: string,
  order: 'asc' | 'desc'
): Promise<string> => {
  const log = (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [PDF] ${message}`, ...args);
  };

  try {
    log('Starting PDF generation', { outputFolder, order });

    // Get all PNG files matching the pattern
    const files = readdirSync(outputFolder)
      .filter(file => file.endsWith('.png'))
      .map(file => ({
        name: file,
        path: join(outputFolder, file),
        mtime: statSync(join(outputFolder, file)).mtime.getTime(),
      }))
      .sort((a, b) => {
        // Extract number from filename for proper sorting
        const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
        return order === 'asc' ? numA - numB : numB - numA;
      });

    if (files.length === 0) {
      throw new Error('No screenshot files found to generate PDF');
    }

    log('Found files to include in PDF', {
      count: files.length,
      files: files.map(f => f.name),
    });

    // Create PDF document
    const doc = new PDFDocument({
      autoFirstPage: false,
      margin: 0,
    });

    const pdfPath = join(outputFolder, 'screenshots.pdf');
    const stream = createWriteStream(pdfPath);
    doc.pipe(stream);

    // Add each image as a page
    for (const file of files) {
      try {
        log('Adding image to PDF', file.name);
        const imageBuffer = readFileSync(file.path);
        
        // Get image dimensions using sharp
        const metadata = await sharp(imageBuffer).metadata();
        const imgWidth = metadata.width || 800;
        const imgHeight = metadata.height || 600;

        // Add new page with image dimensions
        doc.addPage({
          size: [imgWidth, imgHeight],
        });

        // Add image to page (fit to page)
        doc.image(imageBuffer, 0, 0, {
          width: imgWidth,
          height: imgHeight,
          fit: [imgWidth, imgHeight],
        });

        log('Image added successfully', { file: file.name, dimensions: { imgWidth, imgHeight } });
      } catch (error: any) {
        log('Error adding image to PDF', { file: file.name, error: error.message });
        // Continue with next image even if one fails
      }
    }

    // Finalize PDF
    doc.end();

    // Wait for stream to finish
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => {
        log('PDF generated successfully', pdfPath);
        resolve();
      });
      stream.on('error', (error: Error) => {
        log('PDF stream error', error);
        reject(error);
      });
    });

    return pdfPath;
  } catch (error: any) {
    log('PDF generation error', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

