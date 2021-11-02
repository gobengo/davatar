import { binding, then, when } from 'cucumber-tsflow';
import { assert } from 'chai';
import { ElectronAppContext } from '../contexts/ElectronAppContext';

@binding([ElectronAppContext])
export class SettingsSteps {
    constructor(
        protected electronAppContext: ElectronAppContext,
    ){}
    @when(/I navigate to settings/i)
    public async whenINavigateToSettings () {
        const page = await this.electronAppContext.app?.firstWindow();
        await page?.click('text=settings');
    }

    @then(/I see the settings screen/i)
    public async thenISeeTheSettingsScreen() {
        const page = await this.electronAppContext.app?.firstWindow();
        const selector = '*[data-tsest-id="davatar-screen-settings"]';
        const settingsScreen = page?.locator(selector);
        assert.ok(settingsScreen);
    }
}
