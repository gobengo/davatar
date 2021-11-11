import { binding, then, when } from 'cucumber-tsflow';
import { assert } from 'chai';
import { ElectronAppContext } from '../../../packages/renderer/src/modules/davatar-cucumber-contexts/ElectronAppContext';
import TestingLibraryContext from '../../../packages/renderer/src/modules/davatar-cucumber-contexts/TestingLibraryContext';
import SettingsPageKeyController from '../pages/SettingsPageKeyController';
import PlaywrightContext from '../../../packages/renderer/src/modules/davatar-cucumber-contexts/PlaywrightContext';

function assertTruthy(value: unknown): asserts value {
    if (! value) {
        throw new Error('value must be defined');
    }
}

@binding([
    ElectronAppContext,
    TestingLibraryContext,
    PlaywrightContext,
])
export class SettingsSteps {
    keyController: SettingsPageKeyController

    constructor(
        protected electronAppContext: ElectronAppContext,
        protected testingLibrary: TestingLibraryContext,
        protected playwrightContext: PlaywrightContext,
    ){
        this.keyController = new SettingsPageKeyController(
            this.testingLibrary,
            this.playwrightContext,
        );
    }
    @when(/(I|the user) navigates? to settings/i)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async whenINavigateToSettings (actor: string) {
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
        await this.keyController.addKey({
            name: keyName,
            type: 'Ed25519KeyPair2020',
            publicKeyMultibase: 'a',
            privateKeyMultibase: 'a',
        });
    }

    @then('I see a key named {string}')
    public async thenISeeAKey(keyName: string) {
        const controller = this.keyController;
        const keys = await controller.getKeys();
        // await controller.addKey({ name: 'scenarioAddKey' });
        assert.equal(keys[0]?.name, keyName);
    }

    @when('the page is refreshed')
    public async whenThePageIsRefreshed () {
        const controller = this.keyController;
        await controller.refresh();
    }

    @when('the user imports a sample keyPair')
    public async whenTheUserImportsASampleKeyPair() {
        await this.keyController.importSampleKeyPair();
    }

    @then('a keyPair is visible')
    public async thenAKeyPairIsVisible() {
        const keys = await this.keyController.getKeys();
        assert.equal(keys.length, 1);
    }
}
