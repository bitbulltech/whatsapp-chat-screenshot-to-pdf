import React, { useState, useEffect } from 'react';
import { CaptureStatus } from '../../shared/types';

const StatusBar: React.FC = () => {
  const [status, setStatus] = useState<CaptureStatus>('ready');
  const [captureCount, setCaptureCount] = useState(0);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  useEffect(() => {
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
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const loadCaptureCount = async () => {
    try {
      const count = await window.electronAPI.getCaptureCount();
      setCaptureCount(count);
    } catch (error) {
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

  return (
    <div className="status-bar" style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Status:</span>
          <span
            style={{
              color: getStatusColor(),
              fontWeight: '600',
            }}
          >
            {getStatusText()}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Captured:</span>
          <span style={{ color: '#333' }}>{captureCount}</span>
        </div>
      </div>
      {pdfStatus && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: pdfStatus.includes('error') ? '#fee' : '#efe', borderRadius: '4px', fontSize: '0.9rem' }}>
          {pdfStatus}
        </div>
      )}
    </div>
  );
};

export default StatusBar;

