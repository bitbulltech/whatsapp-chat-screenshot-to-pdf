"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const AreaSelector_1 = __importDefault(require("./components/AreaSelector"));
const SettingsPanel_1 = __importDefault(require("./components/SettingsPanel"));
const ControlPanel_1 = __importDefault(require("./components/ControlPanel"));
const StatusBar_1 = __importDefault(require("./components/StatusBar"));
const PreviewWindow_1 = __importDefault(require("./components/PreviewWindow"));
const App = () => {
    return (react_1.default.createElement("div", { className: "app" },
        react_1.default.createElement("header", { className: "app-header" },
            react_1.default.createElement("h1", null, "WhatsApp Screenshot Capture")),
        react_1.default.createElement("main", { className: "app-main" },
            react_1.default.createElement("section", { className: "area-selection-section" },
                react_1.default.createElement("h2", null, "Area Selection"),
                react_1.default.createElement(AreaSelector_1.default, null)),
            react_1.default.createElement("section", { className: "settings-section" },
                react_1.default.createElement("h2", null, "Settings"),
                react_1.default.createElement(SettingsPanel_1.default, null)),
            react_1.default.createElement("section", { className: "controls-section" },
                react_1.default.createElement("h2", null, "Controls"),
                react_1.default.createElement(ControlPanel_1.default, null),
                react_1.default.createElement(StatusBar_1.default, null)),
            react_1.default.createElement("section", { className: "preview-section" },
                react_1.default.createElement("h2", null, "Preview"),
                react_1.default.createElement(PreviewWindow_1.default, null)))));
};
exports.default = App;
