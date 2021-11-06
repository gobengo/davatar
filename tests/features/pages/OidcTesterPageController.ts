import { assertTruthy } from "../../../packages/renderer/src/modules/assert";
import type TestingLibraryContext from "../contexts/TestingLibraryContext";

export default class OidcTesterPageController {
    constructor(private testingLibrary: TestingLibraryContext) {}
    /**
     * Return whether the OidcTester is rendered on the Page
     */
    public async isRendered() {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const testid = await this.testingLibrary.queries.getByTestId(document, 'oidc-tester');
        return Boolean(testid);
    }
    
    public async authenticate() {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const authButton = await this.testingLibrary.queries.getByText(document, 'Authenticate');
        await authButton.click();
    }
}
