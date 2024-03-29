const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbmanager = require('./database/dbmanager.js')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.handle('getMembers', ()=>dbmanager.getMembers());
  ipcMain.handle('getProjectNames', ()=>dbmanager.getProjectNames());
  ipcMain.handle('getProjectEdit', async (event,arg)=>dbmanager.getProjectEdit(arg));
  ipcMain.handle('openDbDialog', async (event)=>dbmanager.openDbDialog());
  ipcMain.handle('getDates', async (event)=>dbmanager.getDates());
  createWindow();
})




// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on("newProject",(event,args)=>{
  dbmanager.newProject(args);
})

ipcMain.on("updateStatus",(event,args)=>{
  dbmanager.updateStatus(args);
})

ipcMain.on("updateProject",(event,args)=>{
  dbmanager.updateProject(args);
})

ipcMain.on("deleteProject",(event,args)=>{
  dbmanager.deleteProject(args);
})