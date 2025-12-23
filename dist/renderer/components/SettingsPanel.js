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
const SettingsPanel = () => {
    const [settings, setSettings] = (0, react_1.useState)({
        holdTime: 2.0,
        scrollDirection: 'down',
        scrollAmount: 500,
        outputFolder: '',
        fileNamePattern: 'screenshot_{number}.png',
        pdfOrder: 'asc',
        generatePdf: true,
    });
    (0, react_1.useEffect)(() => {
        loadConfig();
    }, []);
    const loadConfig = async () => {
        try {
            const config = await window.electronAPI.getConfig();
            if (config.settings) {
                setSettings(config.settings);
            }
        }
        catch (error) {
            console.error('Failed to load config:', error);
        }
    };
    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        // Auto-save PDF order and generatePdf settings immediately
        if (key === 'pdfOrder' || key === 'generatePdf') {
            window.electronAPI.setSettings({ [key]: value }).catch((error) => {
                console.error('Failed to auto-save setting:', error);
            });
        }
    };
    const handleSaveSettings = async () => {
        try {
            await window.electronAPI.setSettings(settings);
            alert('Settings saved successfully!');
        }
        catch (error) {
            alert('Failed to save settings: ' + (error instanceof Error ? error.message : String(error)));
        }
    };
    const handleSelectFolder = async () => {
        try {
            const folder = await window.electronAPI.selectOutputFolder();
            if (folder) {
                handleSettingChange('outputFolder', folder);
            }
        }
        catch (error) {
            alert('Failed to select folder: ' + (error instanceof Error ? error.message : String(error)));
        }
    };
    return (react_1.default.createElement("div", { className: "settings-panel" },
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", null, "Hold Time (seconds):"),
            react_1.default.createElement("input", { type: "number", step: "0.1", min: "0.1", value: settings.holdTime, onChange: (e) => handleSettingChange('holdTime', parseFloat(e.target.value)) })),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", null, "Scroll Direction:"),
            react_1.default.createElement("div", { style: { display: 'flex', gap: '0.5rem' } },
                react_1.default.createElement("button", { className: settings.scrollDirection === 'down' ? '' : 'secondary', onClick: () => handleSettingChange('scrollDirection', 'down') }, "\u25BC Down"),
                react_1.default.createElement("button", { className: settings.scrollDirection === 'up' ? '' : 'secondary', onClick: () => handleSettingChange('scrollDirection', 'up') }, "\u25B2 Up"))),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", null, "Scroll Amount (pixels):"),
            react_1.default.createElement("input", { type: "number", min: "1", step: "1", value: settings.scrollAmount, onChange: (e) => handleSettingChange('scrollAmount', parseInt(e.target.value) || 0) }),
            react_1.default.createElement("small", { style: { color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' } }, "Direct pixel input. Higher values = more scroll distance")),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", null, "Output Folder:"),
            react_1.default.createElement("div", { style: { display: 'flex', gap: '0.5rem' } },
                react_1.default.createElement("input", { type: "text", value: settings.outputFolder, readOnly: true, style: { flex: 1 } }),
                react_1.default.createElement("button", { onClick: handleSelectFolder }, "Browse..."))),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", null, "File Name Pattern:"),
            react_1.default.createElement("input", { type: "text", value: settings.fileNamePattern, onChange: (e) => handleSettingChange('fileNamePattern', e.target.value), placeholder: "screenshot_{number}.png" }),
            react_1.default.createElement("small", { style: { color: '#666', fontSize: '0.8rem' } },
                "Use ",
                '{number}',
                " for sequential numbering")),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
                react_1.default.createElement("input", { type: "checkbox", checked: settings.generatePdf, onChange: (e) => handleSettingChange('generatePdf', e.target.checked) }),
                "Generate PDF after stop")),
        settings.generatePdf && (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", null, "PDF Page Order:"),
            react_1.default.createElement("div", { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' } },
                react_1.default.createElement("button", { className: settings.pdfOrder === 'asc' ? '' : 'secondary', onClick: () => handleSettingChange('pdfOrder', 'asc') }, "\uD83D\uDCC4 Oldest First (Asc)"),
                react_1.default.createElement("button", { className: settings.pdfOrder === 'desc' ? '' : 'secondary', onClick: () => handleSettingChange('pdfOrder', 'desc') }, "\uD83D\uDCC4 Latest First (Desc)")),
            react_1.default.createElement("small", { style: { color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' } }, settings.pdfOrder === 'asc'
                ? 'PDF starts with oldest screenshot (001, 002, 003...)'
                : 'PDF starts with latest screenshot (003, 002, 001...)'))),
        react_1.default.createElement("button", { onClick: handleSaveSettings, style: { marginTop: '1rem' } }, "Save Settings")));
};
exports.default = SettingsPanel;
