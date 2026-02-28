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
    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        const startUrl = 'http://localhost:5173';
        mainWindow.loadURL(startUrl);
        // Open DevTools in dev mode
        mainWindow.webContents.openDevTools();
    }

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
            contents.on('console-message', (e, level, message, line, sourceId) => {
                console.log(`[WebView Console] ${message}`);
            });
        }
    });

    // DevTools are conditionally opened in dev mode above

    // 🪟 WINDOW CONTROLS
    ipcMain.on('window-minimize', () => mainWindow.minimize());
    ipcMain.on('window-maximize', () => {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
    });
    ipcMain.on('window-close', () => mainWindow.close());
}

app.whenReady().then(() => {
    createWindow();

    // Python Backend Startup Logic
    let pythonProcess = null;

    // Resolve location of python_core depending on if we are running from raw source or a packaged .exe
    const basePath = app.isPackaged ? process.resourcesPath : path.join(__dirname, '../../');

    console.log("[RyzenShield] Booting Local AI Backend from:", basePath);

    pythonProcess = spawn('python', ['-m', 'python_core.api.server'], {
        cwd: basePath,
        detached: false
    });

    pythonProcess.stdout.on('data', (data) => console.log(`[Py-Core] ${data}`));
    pythonProcess.stderr.on('data', (data) => console.error(`[Py-Core Error] ${data}`));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    app.on('before-quit', () => {
        if (pythonProcess) {
            console.log("[RyzenShield] Tearing down AI Core Process...");
            pythonProcess.kill();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
