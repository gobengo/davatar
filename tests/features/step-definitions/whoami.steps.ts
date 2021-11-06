import { binding, then, when } from 'cucumber-tsflow';
// import { assert } from 'chai';
import { ElectronAppContext } from '../contexts/ElectronAppContext';
import TestingLibraryContext from '../contexts/TestingLibraryContext';
import PlaywrightContext from '../contexts/PlaywrightContext';
import { assertTruthy } from '../../../packages/renderer/src/modules/assert';
import { assert } from 'chai';

@binding([
    ElectronAppContext,
    TestingLibraryContext,
    PlaywrightContext,
])
export class SettingsSteps {
    constructor(
        protected electronAppContext: ElectronAppContext,
        protected testingLibrary: TestingLibraryContext,
        protected playwrightContext: PlaywrightContext,
    ){}

    @when("I navigate to \\/whoami")
    public async whenINavigateToWhoami() {
        const app = this.electronAppContext.app;
        assertTruthy(app);
        await app.evaluate(async E => {
            const mainWindow = E.BrowserWindow.getAllWindows()[0];
            mainWindow.webContents.send('davatar', {
                type: 'Navigate',
                payload: {
                    href: '/whoami',
                },
            });
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    @then('I see the whoami screen')
    public async thenISeeTheWhoamiScreen() {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const testEl = await this.testingLibrary.queries.getByTestId(document, 'WhoamiScreen');
        assert.equal(Boolean(testEl), true);
    }
}
