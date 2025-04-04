// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    selectDatabase: () => ipcRenderer.invoke('select-database'),
    readDatabase: (filePath: string) => ipcRenderer.invoke('read-database', filePath),
    getDatabaseLinks: () => ipcRenderer.invoke('get-database-links')
});