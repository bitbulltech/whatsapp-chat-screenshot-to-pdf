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
const ControlPanel = () => {
    const [status, setStatus] = (0, react_1.useState)('ready');
    (0, react_1.useEffect)(() => {
        loadStatus();
        const unsubscribe = window.electronAPI.onStatusChange((newStatus) => {
            setStatus(newStatus);
        });
        return () => {
            // Cleanup if needed
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
    const handleStart = async () => {
        try {
            await window.electronAPI.startCapture();
        }
        catch (error) {
            alert('Failed to start capture: ' + (error instanceof Error ? error.message : String(error)));
        }
    };
    const handleStop = async () => {
        try {
            await window.electronAPI.stopCapture();
        }
        catch (error) {
            alert('Failed to stop capture: ' + (error instanceof Error ? error.message : String(error)));
        }
    };
    const handlePause = async () => {
        try {
            if (status === 'capturing') {
                await window.electronAPI.pauseCapture();
            }
            else if (status === 'paused') {
                await window.electronAPI.resumeCapture();
            }
        }
        catch (error) {
            alert('Failed to pause/resume: ' + (error instanceof Error ? error.message : String(error)));
        }
    };
    return (react_1.default.createElement("div", { className: "control-panel" },
        react_1.default.createElement("div", { className: "control-buttons", style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' } },
            react_1.default.createElement("button", { onClick: handleStart, disabled: status === 'capturing' || status === 'paused' }, "\u25B6 Start"),
            react_1.default.createElement("button", { onClick: handlePause, disabled: status === 'ready' || status === 'stopped' }, status === 'paused' ? '▶ Resume' : '⏸ Pause'),
            react_1.default.createElement("button", { onClick: handleStop, disabled: status === 'ready' || status === 'stopped', className: "danger" }, "\u23F9 Stop"))));
};
exports.default = ControlPanel;
