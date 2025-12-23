import React, { useState, useEffect } from 'react';
import AreaSelectorOverlay from './AreaSelectorOverlay';

const AreaSelector: React.FC = () => {
  const [area, setArea] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [showOverlay, setShowOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await window.electronAPI.getConfig();
      if (config.captureArea) {
        setArea(config.captureArea);
      }
    } catch (error) {
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
    } catch (error) {
      console.error('Failed to set window opacity:', error);
    }
  };

  const handleAreaSelected = async (selectedArea: { x: number; y: number; width: number; height: number }) => {
    setArea(selectedArea);
    setShowOverlay(false);
    // Restore window opacity
    try {
      await window.electronAPI.setWindowOpacity(1.0);
    } catch (error) {
      console.error('Failed to restore window opacity:', error);
    }
    try {
      await window.electronAPI.setCaptureArea(selectedArea);
      setError(null);
    } catch (error) {
      setError('Failed to save area: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleCancelSelection = async () => {
    setShowOverlay(false);
    // Restore window opacity
    try {
      await window.electronAPI.setWindowOpacity(1.0);
    } catch (error) {
      console.error('Failed to restore window opacity:', error);
    }
  };

  const handleSaveArea = async () => {
    try {
      await window.electronAPI.setCaptureArea(area);
      setError(null);
      alert('Area saved successfully!');
    } catch (error) {
      setError('Failed to save area: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <>
      {showOverlay && (
        <AreaSelectorOverlay onSelect={handleAreaSelected} onCancel={handleCancelSelection} />
      )}
      <div className="area-selector">
        {error && (
          <div style={{ color: '#dc3545', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        <div className="area-info">
          <div className="form-group">
            <label>X Position:</label>
            <input
              type="number"
              value={area.x}
              onChange={(e) => setArea({ ...area, x: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Y Position:</label>
            <input
              type="number"
              value={area.y}
              onChange={(e) => setArea({ ...area, y: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Width:</label>
            <input
              type="number"
              value={area.width}
              onChange={(e) => setArea({ ...area, width: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Height:</label>
            <input
              type="number"
              value={area.height}
              onChange={(e) => setArea({ ...area, height: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="area-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleSelectArea} disabled={showOverlay}>
            Select Area
          </button>
          <button onClick={handleSaveArea} className="secondary">
            Save Area
          </button>
        </div>
      </div>
    </>
  );
};

export default AreaSelector;

