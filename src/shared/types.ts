export interface CaptureArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AppConfig {
  captureArea: CaptureArea;
  settings: {
    holdTime: number;
    scrollDirection: 'up' | 'down';
    scrollAmount: number;
    outputFolder: string;
    fileNamePattern: string;
    pdfOrder: 'asc' | 'desc';
    generatePdf: boolean;
  };
}

export type CaptureStatus = 'ready' | 'capturing' | 'paused' | 'stopped';

