const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  updateJSON: (json) => ipcRenderer.send('updateJSON', json),
})