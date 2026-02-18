# Phase C: Wrapper Hardening for Headless GTK

## Root Cause
Binary panics on startup: `Failed to initialize GTK` when no display available.
This is a pre-existing infrastructure issue, NOT related to selector fix (P10.3.1).

## Plan
1. Create wrapped launcher script
2. Setup dummy display (Xvfb) if needed
3. Set environment variables to prevent GTK init
4. Launch binary in headless mode
5. Validate IPC availability after launch

## Strategy
Use environment variables + dummy display to allow IPC bridge startup without GUI rendering.

