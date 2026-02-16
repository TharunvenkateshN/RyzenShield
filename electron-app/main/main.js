const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

// 🔒 SECURITY BYPASS FOR DEMO (Allows HTTPS interception without root cert install)
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-insecure-localhost');
app.commandLine.appendSwitch('no-proxy-server');
app.commandLine.appendSwitch('proxy-bypass-list', '127.0.0.1;localhost');
app.commandLine.appendSwitch('disable-web-security'); // 🛡️ Fully permit local AI engine communication for prototype
app.commandLine.appendSwitch('disable-features', 'BlockInsecurePrivateNetworkRequests');

// CRITICAL: Handle certificate errors GLOBALLY for all webviews
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true); // Trust all certificates (DEMO ONLY - allows mitmproxy interception)
    console.log("[RyzenShield] ✅ Certificate bypassed for:", url);
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false, // Custom title bar usage
        transparent: false, // DISABLED for stability
        backgroundColor: '#0a0a0a', // Dark background matching theme
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true, // REQUIRED for Secure Browser feature
        },
    });

    // LOAD THE REACT APP
    const startUrl = 'http://localhost:5173';
    mainWindow.loadURL(startUrl);

    // 🛡️ [RyzenShield] FORCE CSP STRIPPING
    // This allows the Secure Browser to talk to the local AI Engine (127.0.0.1:9000)
    // even when sites like ChatGPT have strict connection rules.
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = { ...details.responseHeaders };
        delete responseHeaders['content-security-policy'];
        delete responseHeaders['Content-Security-Policy'];
        callback({ cancel: false, responseHeaders });
    });

    console.log("[RyzenShield] Main Window Loaded (Security Shields Active)");

    // Track webview creation and disable their individual security hurdles
    app.on('web-contents-created', (event, contents) => {
        if (contents.getType() === 'webview') {
            console.log("[RyzenShield] Webview Created -> Disabling CSP Hurdles");
            contents.session.webRequest.onHeadersReceived((details, callback) => {
                const responseHeaders = { ...details.responseHeaders };
                delete responseHeaders['content-security-policy'];
                delete responseHeaders['Content-Security-Policy'];
                callback({ cancel: false, responseHeaders });
            });
        }
    });

    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools();
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
        app.quit();
    }
});
