"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const electron_store_1 = __importDefault(require("electron-store"));
const defaultConfig = {
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
const store = new electron_store_1.default({
    defaults: defaultConfig,
});
exports.config = {
    get: () => store.store,
    set: (newConfig) => {
        store.set(newConfig);
    },
    getCaptureArea: () => store.get('captureArea'),
    setCaptureArea: (area) => {
        store.set('captureArea', area);
    },
    getSettings: () => store.get('settings'),
    setSettings: (settings) => {
        const current = store.get('settings');
        store.set('settings', { ...current, ...settings });
    },
};
