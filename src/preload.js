// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld("dbapi", {
    sendToMain: (channel,data)=>{
        ipcRenderer.send(channel,data);
    },
    receiveFromMain: (channel,data)=>{
        ipcRenderer.on(channel,data);
    },
});