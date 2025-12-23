import React, { useState, useEffect } from 'react';

const PreviewWindow: React.FC = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCaptureComplete = (filePath: string) => {
      // Load the image file
      // In Electron, we can use file:// protocol
      setPreviewImage(`file://${filePath}`);
      setError(null);
    };

    window.electronAPI.onCaptureComplete(handleCaptureComplete);

    window.electronAPI.onError((errorMsg) => {
      setError(errorMsg);
      setPreviewImage(null);
    });

    return () => {
      // Cleanup handled by Electron IPC
    };
  }, []);

  return (
    <div className="preview-window">
      {previewImage ? (
        <div
          style={{
            width: '100%',
            height: '400px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
          }}
        >
          <img
            src={previewImage}
            alt="Last captured screenshot"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            onError={() => {
              setError('Failed to load preview image');
              setPreviewImage(null);
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '400px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            color: '#999',
          }}
        >
          {error || 'No screenshot captured yet'}
        </div>
      )}
    </div>
  );
};

export default PreviewWindow;

