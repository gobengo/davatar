import { binding, then, when } from 'cucumber-tsflow';
import { assert } from 'chai';
import { ElectronAppContext } from '../../../packages/renderer/src/modules/davatar-cucumber-contexts/ElectronAppContext';
import { assertTruthy } from '../../../packages/renderer/src/modules/assert';
import TestingLibraryContext from '../../../packages/renderer/src/modules/davatar-cucumber-contexts/TestingLibraryContext';
import PlaywrightContext from '../../../packages/renderer/src/modules/davatar-cucumber-contexts/PlaywrightContext';
import { ProfilesScreenPageController } from '../../../packages/renderer/src/modules/screen-profiles';
import { AppNavigationPageController } from '../../../packages/renderer/src/modules/app-navigation';

@binding([
    ElectronAppContext,
    TestingLibraryContext,
    PlaywrightContext,
])
export class ProfilesSteps {
    constructor(
        protected electronAppContext: ElectronAppContext,
        protected testingLibrary: TestingLibraryContext,
        protected playwrightContext: PlaywrightContext,
    ){}

    @when("I navigate to \\/profiles")
    public async whenINavigateToProfiles() {
        const app = this.electronAppContext.app;
        assertTruthy(app);
        await (new AppNavigationPageController()).navigate(app, '/profiles');
    }

    @then("I see testid {string}")
    public async thenISeeTestid(testId: string) {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const testEl = await this.testingLibrary.queries.getByTestId(document, testId);
        assert.equal(Boolean(testEl), true);
    }

    @when("I create a profile")
    public async whenICreateAProfile() {
        const page = new ProfilesScreenPageController(this.testingLibrary);
        await page.createProfile();
    }
}
