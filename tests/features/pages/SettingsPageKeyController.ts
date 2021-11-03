import type { ElementHandle } from "playwright-testing-library/dist/typedefs";
import { assertTruthy } from "../../../packages/renderer/src/modules/assert";
import type TestingLibraryContext from "../contexts/TestingLibraryContext";

export default class SettingsPageKeyController {
    document: ElementHandle
    queries: TestingLibraryContext['queries']
    addKeyButton: Promise<ElementHandle>
    constructor(
        private testingLibrary: TestingLibraryContext,
    ) {
        assertTruthy(testingLibrary.document);
        this.document = testingLibrary.document;
        this.queries = testingLibrary.queries;
        this.addKeyButton = this.queries.getByText(this.document, 'Add Item');
        this.addKeyButton = this.queries.getByText(this.document, 'Add Item');
    }
    public async addKey(key: { name: string }) {
        // click add key button
        await (await this.addKeyButton).click();
        // find new form
        const nameInputs = await this.queries.queryAllByLabelText(this.document, 'name');
        const nameInput = nameInputs[nameInputs.length-1];
        // add name to form
        assertTruthy(nameInput);
        await nameInput.type(key.name);
    }
    public async getKeys() {
        const keyPairForms = await this.queries.getAllByTestId(this.document, 'keypair-form');
        const keys = await Promise.all(keyPairForms.map(async formEl => {
            const key = {
                name: await (await this.queries.getByLabelText(formEl, 'name')).getAttribute('value'),
            };
            return key;
        }));
        console.log({ keys });
        return keys;
    }
}
