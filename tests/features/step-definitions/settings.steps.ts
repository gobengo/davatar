import { binding, then, when } from 'cucumber-tsflow';
import { assert } from 'chai';
import { ElectronAppContext } from '../contexts/ElectronAppContext';
import TestingLibraryContext from '../contexts/TestingLibraryContext';
import SettingsPageKeyController from '../pages/SettingsPageKeyController';

function assertTruthy(value: unknown): asserts value {
    if (! value) {
        throw new Error('value must be defined');
    }
}

@binding([
    ElectronAppContext,
    TestingLibraryContext,
])
export class SettingsSteps {
    constructor(
        protected electronAppContext: ElectronAppContext,
        protected testingLibrary: TestingLibraryContext,
    ){
    }
    @when(/I navigate to settings/i)
    public async whenINavigateToSettings () {
        const page = await this.electronAppContext.app?.firstWindow();
        assertTruthy(page);
        await page.click('text=settings');
    }

    @then(/I see the settings screen/i)
    public async thenISeeTheSettingsScreen() {
        const page = await this.electronAppContext.app?.firstWindow();
        const selector = '*[data-tsest-id="davatar-screen-settings"]';
        const settingsScreen = page?.locator(selector);
        assert.ok(settingsScreen);
    }

    @when('I add a key named {string}')
    public async whenIAddAKey(keyName: string) {
        const controller = new SettingsPageKeyController(this.testingLibrary);
        await controller.addKey({ name: keyName });
    }

    @then('I see a key named {string}')
    public async thenISeeAKey(keyName: string) {
        const controller = new SettingsPageKeyController(this.testingLibrary);
        const keys = await controller.getKeys();
        // await controller.addKey({ name: 'scenarioAddKey' });
        assert.equal(keys[0]?.name, keyName);
    }

}
