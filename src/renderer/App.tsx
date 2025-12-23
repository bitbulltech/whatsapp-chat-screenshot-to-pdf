import React from 'react';
import AreaSelector from './components/AreaSelector';
import SettingsPanel from './components/SettingsPanel';
import ControlPanel from './components/ControlPanel';
import StatusBar from './components/StatusBar';
import PreviewWindow from './components/PreviewWindow';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>WhatsApp Screenshot Capture</h1>
      </header>
      <main className="app-main">
        <section className="area-selection-section">
          <h2>Area Selection</h2>
          <AreaSelector />
        </section>
        <section className="settings-section">
          <h2>Settings</h2>
          <SettingsPanel />
        </section>
        <section className="controls-section">
          <h2>Controls</h2>
          <ControlPanel />
          <StatusBar />
        </section>
        <section className="preview-section">
          <h2>Preview</h2>
          <PreviewWindow />
        </section>
      </main>
    </div>
  );
};

export default App;

