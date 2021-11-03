import { binding, given, then, after} from 'cucumber-tsflow';
import { assert } from 'chai';
import type * as electronPath from 'electron';
import { _electron as electron } from 'playwright';
import { ElectronAppContext } from '../contexts/ElectronAppContext';
import { getDocument, queries } from 'playwright-testing-library';
import TestingLibraryContext from '../contexts/TestingLibraryContext';
import PlaywrightContext from '../contexts/PlaywrightContext';

interface IWindowState {
  isVisible: boolean
  isDevToolsOpened: boolean
  isCrashed: boolean
}

@binding([
  ElectronAppContext,
  TestingLibraryContext,
  PlaywrightContext,
])
export class ElectronAppSteps {
  constructor(
    protected appContext: ElectronAppContext,
    protected testingLibrary: TestingLibraryContext,
    protected playwright: PlaywrightContext,
  ) {}

  @after()
  public async afterCloseApp() {
    const app = this.appContext.app;
    if (app) {
      await app.close();
    }
  }

  @given(/a running app/)
  public async givenAnOpenElectronApp() {
    const electronApp = await electron.launch({args: [__dirname+'/../../../']});
    /**
     * App main window state
     * @type {{isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean}}
     */
    const windowState: IWindowState = await electronApp.evaluate(({BrowserWindow}) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      function getWindowState(mainWindow: electronPath.BrowserWindow): IWindowState {
        return ({
          isVisible: mainWindow.isVisible(),
          isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
          isCrashed: mainWindow.webContents.isCrashed(),
        });
      }
      return new Promise((resolve) => {
        if (mainWindow.isVisible()) {
          resolve(getWindowState(mainWindow));
        } else
          mainWindow.once('ready-to-show', () => setTimeout(() => resolve(getWindowState(mainWindow)), 0));
      });
    });
    // Check main window state
    assert.ok(windowState.isVisible, 'Main window not visible');
    assert.ok(!windowState.isDevToolsOpened, 'DevTools opened');
    assert.ok(!windowState.isCrashed, 'Window crashed');

    this.appContext.app = electronApp;

    /**
     * Rendered Main window web-page
     * @type {Page}
     */
    const page = await electronApp.firstWindow();
    this.playwright.page = page;

    // Check web-page content
    const element = await page.$('#app', {strict: true});
    assert.notStrictEqual(element, null, 'Can\'t find root element');

    const document = await getDocument(page);
    this.testingLibrary.document = document;

    // make sure App is rendered and can find via testing-library
    const foundByTestId = await queries.getByTestId(document, 'davatar-renderer-app');
    assert.ok(foundByTestId);
  }

  @then(/I see an element from the davatar electron html template/)
  public async thenISeeAnElementFromDavatarElectronHtmlTemplate() {
    const page = await this.appContext.app?.firstWindow();
    if ( ! page) { throw new Error('no page'); }
    // this is rendered by App react component. If it's present, then React rendered
    const el = await page.$('*[data-test-id="davatar-electron-html-template"]');
    assert.ok(el);
  }

  @then(/I see an element from the davatar renderer app html/)
  public async thenISeeAnElementFromDavatarRendererApp() {
    const page = await this.appContext.app?.firstWindow();
    await page?.$('*[data-test-id="davatar-renderer-app"]');
  }
}
