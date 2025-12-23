"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = require("fs");
const path_1 = require("path");
const sharp_1 = __importDefault(require("sharp"));
const generatePdf = async (outputFolder, fileNamePattern, order) => {
    const log = (message, ...args) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [PDF] ${message}`, ...args);
    };
    try {
        log('Starting PDF generation', { outputFolder, order });
        // Get all PNG files matching the pattern
        const files = (0, fs_1.readdirSync)(outputFolder)
            .filter(file => file.endsWith('.png'))
            .map(file => ({
            name: file,
            path: (0, path_1.join)(outputFolder, file),
            mtime: (0, fs_1.statSync)((0, path_1.join)(outputFolder, file)).mtime.getTime(),
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
        const doc = new pdfkit_1.default({
            autoFirstPage: false,
            margin: 0,
        });
        const pdfPath = (0, path_1.join)(outputFolder, 'screenshots.pdf');
        const stream = (0, fs_1.createWriteStream)(pdfPath);
        doc.pipe(stream);
        // Add each image as a page
        for (const file of files) {
            try {
                log('Adding image to PDF', file.name);
                const imageBuffer = (0, fs_1.readFileSync)(file.path);
                // Get image dimensions using sharp
                const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
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
            }
            catch (error) {
                log('Error adding image to PDF', { file: file.name, error: error.message });
                // Continue with next image even if one fails
            }
        }
        // Finalize PDF
        doc.end();
        // Wait for stream to finish
        await new Promise((resolve, reject) => {
            stream.on('finish', () => {
                log('PDF generated successfully', pdfPath);
                resolve();
            });
            stream.on('error', (error) => {
                log('PDF stream error', error);
                reject(error);
            });
        });
        return pdfPath;
    }
    catch (error) {
        log('PDF generation error', {
            error: error.message,
            stack: error.stack,
        });
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
};
exports.generatePdf = generatePdf;
