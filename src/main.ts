import { app, BrowserWindow, ipcMain, dialog } from 'electron';
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
ipcMain.handle('select-database', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Select SQLite Database File',
    filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
    properties: ['openFile'],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('read-database', async (event, filePath) => {
  if (!filePath) {
    return { success: false, error: 'No file selected.' };
  }

  let data = {}

  try {
    const db = new sqlite3.Database(filePath);

    const tables: string[] = await new Promise((resolve, reject): void => {
      db.all(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
          [],
          (err: string, data: any): void => {
            if (err) reject(err);
            resolve(data.map(row => row.name));
          }
      );
    });

    // Creates a new table with links to other databases
    const db2 = new sqlite3.Database('./databases.db', (err: string): void => {
      if (err) {
        console.error(err.message);
      }

      // Create table
      db2.run('CREATE TABLE IF NOT EXISTS databases (name TEXT)', (err: string): void => {
        if (err) {
          console.error(err.message);
        }
      });

      // Insert data
      db2.run(`INSERT INTO databases (name) VALUES(?)`, [filePath], (err: string): void => {
        if (err) {
          console.error(err.message);
        }
      });
    });

    if (tables.length === 0) {
      db2.close();
      return { success: false, error: 'No tables found in the database.' };
    }

    data = { tables };

    for (const table of tables) {
      const rows = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${table}`, [], (err: string, data: any): void => {
          if (err) reject(err);
            resolve(data);
        });
      });

      data = { ...data, [table]: rows };
    }

    db.close();
    return { success: true, data: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-database-links', async () => {
    try {
        const db = new sqlite3.Database('./databases.db');

        const dbs = await new Promise((resolve, reject): void => {
            db.all('SELECT * FROM databases', [], (err: string, data: any): void => {
            if (err) reject(err);
            resolve(data.map(row => row.name));
            });
        });

        db.close();
        return dbs;
    } catch (error: unknown) {
      console.error(error as string);
      return [];
    }
});