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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const AreaSelectorOverlay_1 = __importDefault(require("./AreaSelectorOverlay"));
const AreaSelector = () => {
    const [area, setArea] = (0, react_1.useState)({ x: 0, y: 0, width: 800, height: 600 });
    const [showOverlay, setShowOverlay] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadConfig();
    }, []);
    const loadConfig = async () => {
        try {
            const config = await window.electronAPI.getConfig();
            if (config.captureArea) {
                setArea(config.captureArea);
            }
        }
        catch (error) {
            console.error('Failed to load config:', error);
            setError('Failed to load configuration');
        }
    };
    const handleSelectArea = async () => {
        setShowOverlay(true);
        setError(null);
        // Make window transparent (30% opacity = 70% transparent)
        try {
            await window.electronAPI.setWindowOpacity(0.3);
        }
        catch (error) {
            console.error('Failed to set window opacity:', error);
        }
    };
    const handleAreaSelected = async (selectedArea) => {
        setArea(selectedArea);
        setShowOverlay(false);
        // Restore window opacity
        try {
            await window.electronAPI.setWindowOpacity(1.0);
        }
        catch (error) {
            console.error('Failed to restore window opacity:', error);
        }
        try {
            await window.electronAPI.setCaptureArea(selectedArea);
            setError(null);
        }
        catch (error) {
            setError('Failed to save area: ' + (error instanceof Error ? error.message : String(error)));
        }
    };
    const handleCancelSelection = async () => {
        setShowOverlay(false);
        // Restore window opacity
        try {
            await window.electronAPI.setWindowOpacity(1.0);
        }
        catch (error) {
            console.error('Failed to restore window opacity:', error);
        }
    };
    const handleSaveArea = async () => {
        try {
            await window.electronAPI.setCaptureArea(area);
            setError(null);
            alert('Area saved successfully!');
        }
        catch (error) {
            setError('Failed to save area: ' + (error instanceof Error ? error.message : String(error)));
        }
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        showOverlay && (react_1.default.createElement(AreaSelectorOverlay_1.default, { onSelect: handleAreaSelected, onCancel: handleCancelSelection })),
        react_1.default.createElement("div", { className: "area-selector" },
            error && (react_1.default.createElement("div", { style: { color: '#dc3545', marginBottom: '1rem', fontSize: '0.9rem' } }, error)),
            react_1.default.createElement("div", { className: "area-info" },
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", null, "X Position:"),
                    react_1.default.createElement("input", { type: "number", value: area.x, onChange: (e) => setArea({ ...area, x: parseInt(e.target.value) || 0 }) })),
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", null, "Y Position:"),
                    react_1.default.createElement("input", { type: "number", value: area.y, onChange: (e) => setArea({ ...area, y: parseInt(e.target.value) || 0 }) })),
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", null, "Width:"),
                    react_1.default.createElement("input", { type: "number", value: area.width, onChange: (e) => setArea({ ...area, width: parseInt(e.target.value) || 0 }) })),
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", null, "Height:"),
                    react_1.default.createElement("input", { type: "number", value: area.height, onChange: (e) => setArea({ ...area, height: parseInt(e.target.value) || 0 }) }))),
            react_1.default.createElement("div", { className: "area-actions", style: { display: 'flex', gap: '0.5rem' } },
                react_1.default.createElement("button", { onClick: handleSelectArea, disabled: showOverlay }, "Select Area"),
                react_1.default.createElement("button", { onClick: handleSaveArea, className: "secondary" }, "Save Area")))));
};
exports.default = AreaSelector;
