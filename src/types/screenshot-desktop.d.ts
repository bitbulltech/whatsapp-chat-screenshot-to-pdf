declare module 'screenshot-desktop' {
  interface ScreenshotOptions {
    screen?: number;
    filename?: string;
  }

  function screenshot(options?: ScreenshotOptions): Promise<Buffer>;
  export = screenshot;
}

