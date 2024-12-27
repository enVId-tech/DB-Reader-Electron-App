import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import started from 'electron-squirrel-startup';

const sqlite3 = require('sqlite3').verbose();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let win: any;

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  win.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

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
ipcMain.on("toMain", (event, args) => {
  const { name, data } = args; // Destructure the received object

  const filePath = path.join(app.getPath("userData"), name);

  console.log(filePath);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      console.error(error);
      return;
    }

    const db = new sqlite3.Database(filePath);

    // Create a response object
    const responseObj: { rows: any[] } = {
      rows: [],
    };

    db.serialize(() => {
      db.each("SELECT * FROM sqlite_master", (err: string, row: any) => {
        try {
          responseObj.rows.push(row);
        } catch (e) {
          console.error(e);
        }
      });
    });

    // Send result back to renderer process
    win.webContents.send("fromMain", responseObj);
  });
});

