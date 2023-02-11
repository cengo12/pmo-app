// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld("api", {
    sendToA: (channel,data)=>{
        ipcRenderer.send(channel,data);
    },
    receiveFromD: function(func){{
        ipcRenderer.on("D", (event, ...args) => func(event, ...args));
    }
    }
});