# WhatsApp Web Auto Screenshot Capture

A Windows desktop application built with Electron and React that automatically captures screenshots of WhatsApp Web chats with configurable auto-scrolling.

## Features

- **Area Selection**: Select the specific area of the screen to capture
- **Auto-Scroll**: Automatically scrolls the chat and captures screenshots
- **Configurable Settings**: 
  - Hold time (delay after scroll before capture)
  - Scroll direction (up/down)
  - Scroll amount (pixels)
  - Output folder
  - File naming pattern
- **Preview**: View the last captured screenshot
- **Status Tracking**: Real-time status and capture counter

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Windows 10/11

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

**Note:** `robotjs` requires native compilation. On Windows, you may need:
- Python (for node-gyp)
- Visual Studio Build Tools or Visual Studio with C++ workload
- Windows SDK

If `robotjs` installation fails, you can try:
```bash
npm install --build-from-source robotjs
```

Or use an alternative like `nut-js` if robotjs continues to have issues.

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

1. Open WhatsApp Web in Chrome
2. Open the chat you want to capture
3. Launch the application
4. Select the capture area
5. Configure settings (hold time, scroll direction, etc.)
6. Select output folder
7. Click "Start" to begin capturing
8. The application will automatically scroll and capture screenshots

## Project Structure

- `src/main/` - Electron main process code
- `src/renderer/` - React renderer process code
- `src/shared/` - Shared TypeScript types

## License

MIT

