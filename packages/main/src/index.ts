import { app, BrowserWindow } from "electron";
import type { Event } from "electron";
import { join } from "path";
import { URL } from "url";
const OPENID_PROTOCOL = "openid";

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

if (!app.isDefaultProtocolClient(OPENID_PROTOCOL)) {
  app.setAsDefaultProtocolClient(OPENID_PROTOCOL);
}

app.disableHardwareAcceleration();

// // Install "Vue.js devtools"
// if (import.meta.env.MODE === 'development') {
//   app.whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(({default: installExtension, VUEJS3_DEVTOOLS}) => installExtension(VUEJS3_DEVTOOLS, {
//       loadExtensionOptions: {
//         allowFileAccess: true,
//       },
//     }))
//     .catch(e => console.error('Failed install extension:', e));
// }

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    webPreferences: {
      nativeWindowOpen: true,
      preload: join(__dirname, "../../preload/dist/index.cjs"),
      nodeIntegration: true,
    },
  });
  // mainWindow?.webContents?.closeDevTools();

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();

    // switch (import.meta.env.MODE) {
    //   case "development":
    //     mainWindow?.webContents.openDevTools();
    //     break;
    //   default:
    //     mainWindow?.webContents.closeDevTools();
    // }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl =
    import.meta.env.MODE === "development" &&
    import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL(
          "../renderer/dist/index.html",
          "file://" + __dirname,
        ).toString();

  if (!pageUrl) {
    throw new Error("missing pageUrl");
  }

  await mainWindow.loadURL(pageUrl);

  // app.on('open-url', (event, url) => {
  //   event.preventDefault()
  //   console.log('davatar main app open-url', url)
  //   if (mainWindow) {
  //     console.log('emitting open-url on ipcMain', { url });
  //     mainWindow.webContents.send('open-url', url);
  //   }
  // });
  app.on("open-file", (event, path) => {
    console.log("open-file", { path });
  });
  const webContents = mainWindow.webContents;
  const handleRedirect = (e: Event, url: string) => {
    console.log("davatar main handleRedirect", { url });
    if (url != webContents.getURL()) {
      e.preventDefault();
      require("electron").shell.openExternal(url);
    }
  };

  // webContents.on('will-navigate', handleRedirect);
  webContents.on("new-window", handleRedirect);
};

app.on("second-instance", () => {
  console.log("second-instance");
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(createWindow)
  .catch((e) => console.error("Failed create window:", e));

app.on("open-url", (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    console.log("sending open-url to mainWindow.webContents");
    mainWindow.webContents.send("open-url", url);
  }
});

// Auto-updates
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import("electron-updater"))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error("Failed check updates:", e));
}
