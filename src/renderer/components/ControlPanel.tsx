import React, { useState, useEffect } from 'react';
import { CaptureStatus } from '../../shared/types';

const ControlPanel: React.FC = () => {
  const [status, setStatus] = useState<CaptureStatus>('ready');

  useEffect(() => {
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
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handleStart = async () => {
    try {
      await window.electronAPI.startCapture();
    } catch (error) {
      alert('Failed to start capture: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleStop = async () => {
    try {
      await window.electronAPI.stopCapture();
    } catch (error) {
      alert('Failed to stop capture: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handlePause = async () => {
    try {
      if (status === 'capturing') {
        await window.electronAPI.pauseCapture();
      } else if (status === 'paused') {
        await window.electronAPI.resumeCapture();
      }
    } catch (error) {
      alert('Failed to pause/resume: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="control-panel">
      <div className="control-buttons" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleStart}
          disabled={status === 'capturing' || status === 'paused'}
        >
          ▶ Start
        </button>
        <button
          onClick={handlePause}
          disabled={status === 'ready' || status === 'stopped'}
        >
          {status === 'paused' ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={handleStop}
          disabled={status === 'ready' || status === 'stopped'}
          className="danger"
        >
          ⏹ Stop
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;

