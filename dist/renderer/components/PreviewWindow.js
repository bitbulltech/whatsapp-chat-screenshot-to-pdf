"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const PreviewWindow = () => {
    const [previewImage, setPreviewImage] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const handleCaptureComplete = (filePath) => {
            // Load the image file
            // In Electron, we can use file:// protocol
            setPreviewImage(`file://${filePath}`);
            setError(null);
        };
        window.electronAPI.onCaptureComplete(handleCaptureComplete);
        window.electronAPI.onError((errorMsg) => {
            setError(errorMsg);
            setPreviewImage(null);
        });
        return () => {
            // Cleanup handled by Electron IPC
        };
    }, []);
    return (react_1.default.createElement("div", { className: "preview-window" }, previewImage ? (react_1.default.createElement("div", { style: {
            width: '100%',
            height: '400px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
        } },
        react_1.default.createElement("img", { src: previewImage, alt: "Last captured screenshot", style: {
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
            }, onError: () => {
                setError('Failed to load preview image');
                setPreviewImage(null);
            } }))) : (react_1.default.createElement("div", { style: {
            width: '100%',
            height: '400px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            color: '#999',
        } }, error || 'No screenshot captured yet'))));
};
exports.default = PreviewWindow;
