#include <windows.h>
#include <iostream>

// Simple Clipboard Viewer for RyzenShield
// This hooks into the Windows Clipboard Chain and notifies the Python backend

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

int main() {
    const char* CLASS_NAME = "RyzenShieldClipboardWatcherClass";
    
    WNDCLASS wc = { };
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = CLASS_NAME;
    
    RegisterClass(&wc);
    
    // Create a message-only window
    HWND hwnd = CreateWindowEx(
        0, CLASS_NAME, "RyzenShield Watcher", 
        0, 0, 0, 0, 0, 
        HWND_MESSAGE, NULL, GetModuleHandle(NULL), NULL
    );

    if (hwnd == NULL) {
        return 0;
    }
    
    // Set up clipboard listener
    AddClipboardFormatListener(hwnd);
    
    std::cout << "RyzenShield Clipboard Watcher Active..." << std::endl;

    MSG msg = { };
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    RemoveClipboardFormatListener(hwnd);
    return 0;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
    case WM_CLIPBOARDUPDATE:
        std::cout << "[EVENT] Clipboard Content Changed" << std::endl;
        // Logic: Read Clipboard -> Send to Python API (localhost:8000/scan)
        return 0;
    
    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}
