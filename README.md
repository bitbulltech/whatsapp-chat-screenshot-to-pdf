# WhatsApp Web Auto Screenshot Capture

A Windows desktop application built with Electron and React that automatically captures screenshots of WhatsApp Web chats with configurable auto-scrolling and PDF generation.

# Download
https://github.com/bitbulltech/whatsapp-chat-screenshot-to-pdf/raw/refs/heads/main/release/WhatsApp%20Screenshot%20Capture-1.0.0-portable.exe

Or download complete zip file of source code then find .exe file at path release/WhatsApp Screenshot Capture-1.0.0-portable.exe
## Features

### Core Features
- **Area Selection**: 
  - Visual area selector with drag-to-select functionality
  - Window becomes 70% transparent during selection for easy viewing
  - Manual coordinate input option
  - Supports Windows DPI scaling (120%, 150%, etc.)
  
- **Auto-Scroll**: 
  - Mouse wheel scrolling using Windows API
  - Configurable scroll direction (up/down)
  - Direct pixel input for scroll amount
  - Automatic scrolling after each screenshot capture
  
- **Screenshot Capture**:
  - High-quality PNG screenshots
  - Sequential file numbering
  - Customizable file naming pattern
  - Automatic folder creation
  - DPI scaling support for accurate area capture

- **PDF Generation**:
  - Automatically generates PDF after stopping capture
  - Configurable page order:
    - **Oldest First (Ascending)**: Starts with screenshot 001, 002, 003...
    - **Latest First (Descending)**: Starts with latest screenshot, goes backwards
  - Each screenshot becomes a page in the PDF
  - PDF saved as `screenshots.pdf` in the output folder
  - Can be enabled/disabled in settings

### Settings & Configuration
- **Hold Time**: Delay in seconds after scroll before capturing (supports decimals)
- **Scroll Direction**: Up or Down
- **Scroll Amount**: Direct pixel input for precise control
- **Output Folder**: Select where screenshots are saved
- **File Naming Pattern**: Customize filename format (use `{number}` for sequential numbering)
- **PDF Generation**: Enable/disable automatic PDF creation
- **PDF Order**: Choose ascending or descending order for PDF pages
- All settings are automatically saved and persisted

### User Interface
- **Preview Window**: View the last captured screenshot
- **Status Bar**: Real-time status (Ready, Capturing, Paused, Stopped) and capture counter
- **Control Panel**: Start, Pause/Resume, and Stop buttons
- **Settings Panel**: Easy-to-use configuration interface
- **Area Selector**: Visual coordinate display and editing

### Technical Features
- **DPI Scaling Support**: Works correctly at any Windows display scale (100%, 120%, 150%, etc.)
- **Coordinate Conversion**: Automatic conversion between logical and physical pixels
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging**: Detailed console logs for debugging (DevTools)
- **Cross-Platform Ready**: Built with Electron (Windows-focused, but can be adapted)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Windows 10/11

## Installation

### For End Users

Download the latest release from the `release/` folder:
- **Installer**: `WhatsApp Screenshot Capture Setup 1.0.0.exe` - Standard Windows installer
- **Portable**: `WhatsApp Screenshot Capture-1.0.0-portable.exe` - No installation required

Both executables include all dependencies and are ready to use.

### For Developers

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

All dependencies are JavaScript-based and don't require native compilation.

## Development

Run the application in development mode:
```bash
npm run start:dev
```

This will:
- Compile TypeScript files
- Start the webpack dev server for the renderer process
- Launch Electron

## Building

Build the application for production:
```bash
npm run build
```

Create a distributable package:
```bash
npm run dist
```

The output will be in the `release/` directory.

## Usage

### Step-by-Step Guide

1. **Open WhatsApp Web**:
   - Open Chrome browser
   - Navigate to web.whatsapp.com
   - Open the chat conversation you want to capture

2. **Launch the Application**:
   - Run the executable (installer or portable version)
   - The application window will open

3. **Select Capture Area**:
   - Click "Select Area" button
   - The window becomes transparent (70% transparent)
   - Drag to select the WhatsApp chat area you want to capture
   - Release mouse to confirm selection
   - Or manually enter coordinates (X, Y, Width, Height)
   - Click "Save Area" to save the selection

4. **Configure Settings**:
   - **Hold Time**: Set delay after scroll before capture (e.g., 2.0 seconds)
   - **Scroll Direction**: Choose Up or Down
   - **Scroll Amount**: Enter pixels to scroll (e.g., 500 pixels)
   - **Output Folder**: Click "Browse..." to select where screenshots are saved
   - **File Name Pattern**: Customize filename (default: `screenshot_{number}.png`)
   - **Generate PDF**: Check to enable automatic PDF generation
   - **PDF Page Order**: Choose "Oldest First" or "Latest First"
   - Click "Save Settings"

5. **Start Capturing**:
   - **Important**: Click on Chrome/WhatsApp Web window to focus it
   - Click "Start" button in the application
   - The app will:
     - Wait for hold time
     - Capture screenshot
     - Save with sequential number
     - Scroll the chat automatically
     - Repeat until stopped

6. **Control Capture**:
   - **Pause**: Temporarily pause capturing (click again to resume)
   - **Stop**: Stop capturing and generate PDF (if enabled)

7. **View Results**:
   - Screenshots are saved in the selected output folder
   - Preview shows the last captured screenshot
   - Status bar shows capture count
   - PDF is generated automatically when you click "Stop" (if enabled)

### PDF Generation

- **Automatic**: PDF is generated automatically when you click "Stop" (if enabled in settings)
- **File Name**: `screenshots.pdf`
- **Location**: Same folder as your screenshots
- **Order Options**:
  - **Oldest First (Ascending)**: PDF pages in order 001, 002, 003...
  - **Latest First (Descending)**: PDF pages in reverse order (latest first)
- **Status**: Status bar shows "Generating PDF..." and completion message

## Project Structure

```
whatsappscreenshot/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point & IPC handlers
│   │   ├── window.ts      # Window management
│   │   ├── screenshot.ts  # Screenshot capture logic
│   │   ├── scroll.ts      # Auto-scroll implementation
│   │   ├── pdfGenerator.ts # PDF generation
│   │   ├── config.ts      # Configuration management
│   │   ├── windowDetector.ts # Window detection
│   │   └── preload.ts     # Preload script for IPC
│   ├── renderer/          # React renderer process
│   │   ├── components/
│   │   │   ├── AreaSelector.tsx      # Area selection UI
│   │   │   ├── AreaSelectorOverlay.tsx # Selection overlay
│   │   │   ├── SettingsPanel.tsx    # Settings configuration
│   │   │   ├── ControlPanel.tsx     # Start/Stop/Pause controls
│   │   │   ├── StatusBar.tsx        # Status display
│   │   │   └── PreviewWindow.tsx    # Screenshot preview
│   │   ├── App.tsx        # Main React component
│   │   └── styles/        # CSS styles
│   └── shared/            # Shared TypeScript types
│       └── types.ts
├── assets/                # Application assets
├── release/               # Built executables (after npm run dist)
└── package.json
```

## Key Technologies

- **Electron**: Desktop application framework
- **React**: UI framework
- **TypeScript**: Type-safe development
- **Sharp**: Image processing and cropping
- **PDFKit**: PDF generation
- **screenshot-desktop**: Screenshot capture
- **electron-store**: Configuration persistence

## Troubleshooting

### Screenshots don't match selected area
- Check Windows display scale setting (Settings → Display → Scale)
- The app automatically handles DPI scaling
- Check console logs for coordinate conversion details

### Scrolling not working
- Make sure Chrome/WhatsApp Web is focused (click on it) before starting capture
- Check console logs (Ctrl+Shift+I) for scroll operation details
- Verify scroll amount is set appropriately (try 500-1000 pixels)

### PDF not generating
- Ensure "Generate PDF after stop" is enabled in settings
- Check that output folder is selected
- Verify screenshot files exist in the output folder
- Check console logs for PDF generation errors

### Area selection issues
- Make sure to click "Select Area" and drag to select
- Window becomes transparent during selection
- Coordinates are displayed in real-time
- Click "Save Area" after selection

## Development

### Running in Development Mode

```bash
npm run start:dev
```

This will:
- Compile TypeScript files in watch mode
- Start webpack dev server for the renderer process
- Launch Electron with DevTools open

### Building

Build the application:
```bash
npm run build
```

Create distributable executables:
```bash
npm run dist
```

Output will be in the `release/` directory:
- `WhatsApp Screenshot Capture Setup 1.0.0.exe` - Installer
- `WhatsApp Screenshot Capture-1.0.0-portable.exe` - Portable version

## License

MIT

