import React, { useState, useEffect } from 'react';

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState({
    holdTime: 2.0,
    scrollDirection: 'down' as 'up' | 'down',
    scrollAmount: 500,
    outputFolder: '',
    fileNamePattern: 'screenshot_{number}.png',
    pdfOrder: 'asc' as 'asc' | 'desc',
    generatePdf: true,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await window.electronAPI.getConfig();
      if (config.settings) {
        setSettings(config.settings);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
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
    } catch (error) {
      alert('Failed to save settings: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSelectFolder = async () => {
    try {
      const folder = await window.electronAPI.selectOutputFolder();
      if (folder) {
        handleSettingChange('outputFolder', folder);
      }
    } catch (error) {
      alert('Failed to select folder: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="settings-panel">
      <div className="form-group">
        <label>Hold Time (seconds):</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={settings.holdTime}
          onChange={(e) => handleSettingChange('holdTime', parseFloat(e.target.value))}
        />
      </div>
      <div className="form-group">
        <label>Scroll Direction:</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={settings.scrollDirection === 'down' ? '' : 'secondary'}
            onClick={() => handleSettingChange('scrollDirection', 'down')}
          >
            ▼ Down
          </button>
          <button
            className={settings.scrollDirection === 'up' ? '' : 'secondary'}
            onClick={() => handleSettingChange('scrollDirection', 'up')}
          >
            ▲ Up
          </button>
        </div>
      </div>
      <div className="form-group">
        <label>Scroll Amount (pixels):</label>
        <input
          type="number"
          min="1"
          step="1"
          value={settings.scrollAmount}
          onChange={(e) => handleSettingChange('scrollAmount', parseInt(e.target.value) || 0)}
        />
        <small style={{ color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
          Direct pixel input. Higher values = more scroll distance
        </small>
      </div>
      <div className="form-group">
        <label>Output Folder:</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={settings.outputFolder}
            readOnly
            style={{ flex: 1 }}
          />
          <button onClick={handleSelectFolder}>Browse...</button>
        </div>
      </div>
      <div className="form-group">
        <label>File Name Pattern:</label>
        <input
          type="text"
          value={settings.fileNamePattern}
          onChange={(e) => handleSettingChange('fileNamePattern', e.target.value)}
          placeholder="screenshot_{number}.png"
        />
        <small style={{ color: '#666', fontSize: '0.8rem' }}>
          Use {'{number}'} for sequential numbering
        </small>
      </div>
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={settings.generatePdf}
            onChange={(e) => handleSettingChange('generatePdf', e.target.checked)}
          />
          Generate PDF after stop
        </label>
      </div>
      {settings.generatePdf && (
        <div className="form-group">
          <label>PDF Page Order:</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={settings.pdfOrder === 'asc' ? '' : 'secondary'}
              onClick={() => handleSettingChange('pdfOrder', 'asc')}
            >
              📄 Oldest First (Asc)
            </button>
            <button
              className={settings.pdfOrder === 'desc' ? '' : 'secondary'}
              onClick={() => handleSettingChange('pdfOrder', 'desc')}
            >
              📄 Latest First (Desc)
            </button>
          </div>
          <small style={{ color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
            {settings.pdfOrder === 'asc' 
              ? 'PDF starts with oldest screenshot (001, 002, 003...)'
              : 'PDF starts with latest screenshot (003, 002, 001...)'}
          </small>
        </div>
      )}
      <button onClick={handleSaveSettings} style={{ marginTop: '1rem' }}>
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPanel;

