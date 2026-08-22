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
  getUserConfig: (key) => ipcRenderer.invoke('get-user-config', key),
  saveUserConfig: (key, userItems) => ipcRenderer.invoke('save-user-config', { key, userItems }),
  getAllUserConfigs: () => ipcRenderer.invoke('get-all-user-configs'),
  
  // Drive File Library
  listDriveFiles: () => ipcRenderer.invoke('list-drive-files'),
  loadDriveFile: (fileId) => ipcRenderer.invoke('load-drive-file', fileId),
  saveDriveFile: (payload) => ipcRenderer.invoke('save-drive-file', payload),

  // Window Controls
  resizeWindow: (isMin) => ipcRenderer.send('resize-window', isMin),
  restoreWindow: () => ipcRenderer.send('restore-window'),
  moveWindow: (dx, dy) => ipcRenderer.send('move-window', { dx, dy }),
  quitApp: () => ipcRenderer.send('quit-app')
});
