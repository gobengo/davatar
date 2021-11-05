import {contextBridge, ipcRenderer} from 'electron';

const apiKey = 'electron';
/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
const api: ElectronApi = {
  versions: process.versions,
  onOpenUrl(cb) {
    const eecb = (event: Electron.Event, url: string) => {
      cb(url);
    };
    ipcRenderer.on('open-url', eecb);
    return {
      unsubscribe() {
        return ipcRenderer.off('open-url', eecb);
      },
    };
  },
  onAppControlMessage(cb) {
    const listener = (event: Electron.Event, message: AppControlMessage) => {
      cb(message);
    };
    ipcRenderer.on('davatar', listener);
    return {
      unsubscribe() {
        return ipcRenderer.off('davatar', listener);
      },
    };
  },
};

/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */
contextBridge.exposeInMainWorld(apiKey, api);
