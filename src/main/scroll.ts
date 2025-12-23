import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { screen } from 'electron';

const execAsync = promisify(exec);

let scrollEnabled = false;

export const scrollChat = async (
  direction: 'up' | 'down',
  amount: number
): Promise<void> => {
  const log = (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Scroll] ${message}`, ...args);
  };
  
  try {
    log('Starting scroll operation', { direction, amount });
    
    // Calculate mouse wheel scroll units
    // Windows mouse wheel typically uses 120 units per "click"
    // Convert pixels to wheel units (approximately)
    const wheelUnits = Math.round((amount / 3) * 120); // Rough conversion
    const scrollDirection = direction === 'down' ? -wheelUnits : wheelUnits;
    
    log('Calculated scroll units', { wheelUnits, scrollDirection, inputAmount: amount });
    
    // Get primary display to find center point for mouse position
    const primaryDisplay = screen.getPrimaryDisplay();
    const centerX = Math.floor(primaryDisplay.workAreaSize.width / 2);
    const centerY = Math.floor(primaryDisplay.workAreaSize.height / 2);
    
    log('Display info', {
      workAreaWidth: primaryDisplay.workAreaSize.width,
      workAreaHeight: primaryDisplay.workAreaSize.height,
      centerX,
      centerY,
      scaleFactor: primaryDisplay.scaleFactor,
    });
    
    // Create PowerShell script to simulate mouse wheel scroll
    // Using SendInput API which is more reliable than mouse_event
    const psScript = `
# Load required assemblies
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class MouseWheel {
    [StructLayout(LayoutKind.Sequential)]
    public struct INPUT {
        public uint type;
        public MOUSEINPUT mi;
    }
    
    [StructLayout(LayoutKind.Sequential)]
    public struct MOUSEINPUT {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }
    
    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);
    
    private const uint INPUT_MOUSE = 0;
    private const uint MOUSEEVENTF_WHEEL = 0x0800;
    
    public static void Scroll(int delta) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_MOUSE;
        inputs[0].mi.mouseData = (uint)delta;
        inputs[0].mi.dwFlags = MOUSEEVENTF_WHEEL;
        inputs[0].mi.dx = 0;
        inputs[0].mi.dy = 0;
        inputs[0].mi.time = 0;
        inputs[0].mi.dwExtraInfo = IntPtr.Zero;
        
        uint result = SendInput(1, inputs, System.Runtime.InteropServices.Marshal.SizeOf(typeof(INPUT)));
        if (result == 0) {
            throw new Exception("SendInput failed. Error: " + System.Runtime.InteropServices.Marshal.GetLastWin32Error());
        }
    }
}
"@

Write-Host "[Scroll] Starting scroll operation"
Write-Host "[Scroll] Direction: ${direction}, Amount: ${amount}px, Scroll units: ${scrollDirection}"

# Get current mouse position to restore later
$originalPos = [System.Windows.Forms.Cursor]::Position
Write-Host "[Scroll] Original mouse position: ($($originalPos.X), $($originalPos.Y))"

# Move mouse to center of screen to ensure scroll goes to active window
Write-Host "[Scroll] Moving mouse to center: (${centerX}, ${centerY})"
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${centerX}, ${centerY})
Start-Sleep -Milliseconds 100

# Small delay to ensure window focus
Start-Sleep -Milliseconds 50

Write-Host "[Scroll] Sending mouse wheel scroll: ${scrollDirection} units"
try {
    # Perform mouse wheel scroll using SendInput
    [MouseWheel]::Scroll(${scrollDirection})
    Write-Host "[Scroll] Scroll command sent successfully"
} catch {
    Write-Host "[Scroll] ERROR: $($_.Exception.Message)"
    Write-Host "[Scroll] Stack trace: $($_.Exception.StackTrace)"
    throw
}

Start-Sleep -Milliseconds 150

# Restore original mouse position
[System.Windows.Forms.Cursor]::Position = $originalPos
Write-Host "[Scroll] Mouse position restored"
Write-Host "[Scroll] Scroll operation completed"
    `.trim();
    
    const scriptPath = join(tmpdir(), `scroll_${Date.now()}.ps1`);
    log('Script path', scriptPath);
    
    try {
      // Write PowerShell script to temp file
      writeFileSync(scriptPath, psScript, 'utf8');
      log('Script file written successfully');
      
      // Execute PowerShell script (runs visible to see output for debugging)
      log('Executing PowerShell script...');
      log('PowerShell command', `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
      
      const result = await execAsync(`powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptPath}"`, {
        timeout: 10000,
        windowsHide: false, // Visible for debugging
        maxBuffer: 1024 * 1024, // 1MB buffer for output
      });
      
      log('PowerShell execution completed', {
        stdout: result.stdout ? result.stdout.trim() : '(empty)',
        stderr: result.stderr ? result.stderr.trim() : '(empty)',
      });
      
      // Check if there were any errors in the output
      if (result.stderr && result.stderr.trim().length > 0) {
        log('PowerShell stderr detected', result.stderr);
      }
      
      // Clean up temp file
      try {
        unlinkSync(scriptPath);
        log('Temp script file cleaned up');
      } catch (cleanupError) {
        log('Failed to cleanup temp script', cleanupError);
      }
      
    } catch (error: any) {
      log('Error during scroll execution', {
        message: error.message,
        code: error.code,
        stdout: error.stdout,
        stderr: error.stderr,
      });
      
      // Clean up temp file on error
      try {
        unlinkSync(scriptPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw error;
    }
    
    // Wait a bit for scroll animation to complete
    log('Waiting for scroll animation...');
    await new Promise(resolve => setTimeout(resolve, 300));
    log('Scroll operation completed successfully');
    
  } catch (error: any) {
    log('Scroll error occurred', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to scroll: ${error.message}`);
  }
};

export const setScrollEnabled = (enabled: boolean): void => {
  scrollEnabled = enabled;
};

export const isScrollEnabled = (): boolean => {
  return scrollEnabled;
};

