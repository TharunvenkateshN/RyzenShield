const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#0a0a0a',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For prototype speed, usually true in prod
        },
        // frame: false, // Custom frame later
    });

    // Load Vite Dev Server 
    // In production, load file using mainWindow.loadFile(...)
    mainWindow.loadURL('http://localhost:5173');
    // Note: Vite default port is 5173

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Python Backend Startup Logic (Placeholder)
    // pythonProcess = spawn('python', ['../python-core/app.py']);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (pythonProcess) pythonProcess.kill();
        app.quit();
    }
});
