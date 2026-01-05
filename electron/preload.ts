import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getMachines: () => ipcRenderer.invoke('get-machines'),
  addMachine: (data: { name: string; mac: string }) => ipcRenderer.invoke('add-machine', data),
  deleteMachine: (id: string) => ipcRenderer.invoke('delete-machine', id),
  wake: (mac: string) => ipcRenderer.invoke('wake', mac),
  settings: {
    get: () => ipcRenderer.invoke('get-settings'),
    set: (dir: string) => ipcRenderer.invoke('set-data-dir', dir),
    choose: () => ipcRenderer.invoke('choose-data-dir'),
  },
});
