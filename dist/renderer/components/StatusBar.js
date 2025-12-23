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
const StatusBar = () => {
    const [status, setStatus] = (0, react_1.useState)('ready');
    const [captureCount, setCaptureCount] = (0, react_1.useState)(0);
    const [pdfStatus, setPdfStatus] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadStatus();
        loadCaptureCount();
        const unsubscribe = window.electronAPI.onStatusChange((newStatus) => {
            setStatus(newStatus);
            loadCaptureCount();
        });
        // PDF generation events
        window.electronAPI.onPdfGenerationStarted(() => {
            setPdfStatus('Generating PDF...');
        });
        window.electronAPI.onPdfGenerationComplete((filePath) => {
            setPdfStatus(`PDF generated: ${filePath.split('\\').pop() || filePath.split('/').pop()}`);
            setTimeout(() => setPdfStatus(null), 5000); // Clear after 5 seconds
        });
        window.electronAPI.onPdfGenerationError((error) => {
            setPdfStatus(`PDF error: ${error}`);
            setTimeout(() => setPdfStatus(null), 5000); // Clear after 5 seconds
        });
        // Poll for capture count updates
        const interval = setInterval(() => {
            loadCaptureCount();
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);
    const loadStatus = async () => {
        try {
            const currentStatus = await window.electronAPI.getStatus();
            setStatus(currentStatus);
        }
        catch (error) {
            console.error('Failed to load status:', error);
        }
    };
    const loadCaptureCount = async () => {
        try {
            const count = await window.electronAPI.getCaptureCount();
            setCaptureCount(count);
        }
        catch (error) {
            console.error('Failed to load capture count:', error);
        }
    };
    const getStatusColor = () => {
        switch (status) {
            case 'ready':
                return '#6c757d';
            case 'capturing':
                return '#25d366';
            case 'paused':
                return '#ffc107';
            case 'stopped':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };
    const getStatusText = () => {
        switch (status) {
            case 'ready':
                return 'Ready';
            case 'capturing':
                return 'Capturing...';
            case 'paused':
                return 'Paused';
            case 'stopped':
                return 'Stopped';
            default:
                return 'Unknown';
        }
    };
    return (react_1.default.createElement("div", { className: "status-bar", style: { marginTop: '1rem' } },
        react_1.default.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' } },
            react_1.default.createElement("div", null,
                react_1.default.createElement("span", { style: { fontWeight: 'bold', marginRight: '0.5rem' } }, "Status:"),
                react_1.default.createElement("span", { style: {
                        color: getStatusColor(),
                        fontWeight: '600',
                    } }, getStatusText())),
            react_1.default.createElement("div", null,
                react_1.default.createElement("span", { style: { fontWeight: 'bold', marginRight: '0.5rem' } }, "Captured:"),
                react_1.default.createElement("span", { style: { color: '#333' } }, captureCount))),
        pdfStatus && (react_1.default.createElement("div", { style: { marginTop: '0.5rem', padding: '0.5rem', backgroundColor: pdfStatus.includes('error') ? '#fee' : '#efe', borderRadius: '4px', fontSize: '0.9rem' } }, pdfStatus))));
};
exports.default = StatusBar;
