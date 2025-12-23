import Store from 'electron-store';
import { AppConfig } from '../shared/types';

const defaultConfig: AppConfig = {
  captureArea: {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  },
  settings: {
    holdTime: 2.0,
    scrollDirection: 'down',
    scrollAmount: 500,
    outputFolder: '',
    fileNamePattern: 'screenshot_{number}.png',
    pdfOrder: 'asc',
    generatePdf: true,
  },
};

const store = new Store<AppConfig>({
  defaults: defaultConfig,
});

export const config = {
  get: (): AppConfig => store.store,
  set: (newConfig: Partial<AppConfig>): void => {
    store.set(newConfig);
  },
  getCaptureArea: () => store.get('captureArea'),
  setCaptureArea: (area: AppConfig['captureArea']) => {
    store.set('captureArea', area);
  },
  getSettings: () => store.get('settings'),
  setSettings: (settings: Partial<AppConfig['settings']>) => {
    const current = store.get('settings');
    store.set('settings', { ...current, ...settings });
  },
};

