import React, { useState, useEffect, useRef } from 'react';

interface AreaSelectorOverlayProps {
  onSelect: (area: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

const AreaSelectorOverlay: React.FC<AreaSelectorOverlayProps> = ({ onSelect, onCancel }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [windowBounds, setWindowBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get window bounds to convert client coordinates to screen coordinates
    const loadWindowBounds = async () => {
      try {
        const bounds = await window.electronAPI.getWindowBounds();
        const screenSize = await window.electronAPI.getScreenSize();
        
        console.log('[AreaSelector] Screen info:', screenSize);
        console.log('[AreaSelector] Window bounds:', bounds);
        console.log('[AreaSelector] Scale factor:', screenSize.scaleFactor);
        
        // Account for DPI scaling - if scale is 120%, we need to adjust coordinates
        // The bounds already account for scaling, but we need to ensure coordinates match screenshot
        setWindowBounds(bounds);
      } catch (error) {
        console.error('Failed to get window bounds:', error);
      }
    };
    loadWindowBounds();
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setIsSelecting(true);
      
      // Convert client coordinates to screen coordinates
      // These are in logical pixels (Windows scaled coordinates)
      // We'll store them as-is and convert during screenshot capture
      const screenX = e.clientX + windowBounds.x;
      const screenY = e.clientY + windowBounds.y;
      
      console.log('[AreaSelector] Mouse down:', {
        clientX: e.clientX,
        clientY: e.clientY,
        windowX: windowBounds.x,
        windowY: windowBounds.y,
        screenX,
        screenY,
      });
      
      setStartPos({ x: screenX, y: screenY });
      setCurrentPos({ x: screenX, y: screenY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isSelecting) {
        // Convert client coordinates to screen coordinates (logical pixels)
        const screenX = e.clientX + windowBounds.x;
        const screenY = e.clientY + windowBounds.y;
        setCurrentPos({ x: screenX, y: screenY });
      }
    };

    const handleMouseUp = async () => {
      if (isSelecting) {
        const screenSize = await window.electronAPI.getScreenSize().catch(() => ({ scaleFactor: 1 }));
        
        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);

        console.log('[AreaSelector] Mouse up - Selected area:', {
          x,
          y,
          width,
          height,
          scaleFactor: screenSize.scaleFactor,
          note: 'Coordinates are in logical pixels (Windows scaled). Will be converted to physical pixels during capture.',
        });

        if (width > 10 && height > 10) {
          onSelect({ x, y, width, height });
        }
        setIsSelecting(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelecting, startPos, currentPos, windowBounds, onSelect, onCancel]);

  // For display, use client coordinates (relative to window)
  const selectionBox = isSelecting
    ? {
        left: Math.min(startPos.x - windowBounds.x, currentPos.x - windowBounds.x),
        top: Math.min(startPos.y - windowBounds.y, currentPos.y - windowBounds.y),
        width: Math.abs(currentPos.x - startPos.x),
        height: Math.abs(currentPos.y - startPos.y),
      }
    : null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        cursor: 'crosshair',
      }}
    >
      {selectionBox && (
        <div
          style={{
            position: 'absolute',
            left: `${selectionBox.left}px`,
            top: `${selectionBox.top}px`,
            width: `${selectionBox.width}px`,
            height: `${selectionBox.height}px`,
            border: '2px solid #25d366',
            backgroundColor: 'rgba(37, 211, 102, 0.1)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '-25px',
              left: 0,
              backgroundColor: '#25d366',
              color: 'white',
              padding: '2px 6px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            {selectionBox.width} × {selectionBox.height}
          </div>
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        Drag to select area • Press ESC to cancel
      </div>
    </div>
  );
};

export default AreaSelectorOverlay;

