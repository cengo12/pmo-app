// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld("dbapi", {
    sendToMain: (channel,data)=>{
        ipcRenderer.send(channel,data);
    },
    getMembers: () => ipcRenderer.invoke('getMembers'),
    getProjectNames: () => ipcRenderer.invoke('getProjectNames'),
    getProjectEdit: (id) => ipcRenderer.invoke('getProjectEdit',id),
    getDatabaseFile: () => ipcRenderer.invoke('getDatabaseFile'),
});