const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Auth
  checkAuth: () => ipcRenderer.invoke('auth-check'),
  loginGoogle: () => ipcRenderer.invoke('auth-login'),
  logout: () => ipcRenderer.invoke('auth-logout'),

  // Data
  saveData: (data) => ipcRenderer.invoke('save-prompt', data),
  listPrompts: () => ipcRenderer.invoke('list-prompts'),
  deletePrompt: (id) => ipcRenderer.invoke('delete-prompt', id),
  
  // Configs
  getConfigs: () => ipcRenderer.invoke('get-configs'),
  getSongConfigs: () => ipcRenderer.invoke('get-song-configs'),
  
  // Window Controls
  resizeWindow: (isMin) => ipcRenderer.send('resize-window', isMin),
  quitApp: () => ipcRenderer.send('quit-app')
});
