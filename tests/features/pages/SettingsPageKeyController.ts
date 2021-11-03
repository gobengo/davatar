import { assertTruthy } from "../../../packages/renderer/src/modules/assert";
import type PlaywrightContext from "../contexts/PlaywrightContext";
import type TestingLibraryContext from "../contexts/TestingLibraryContext";

export default class SettingsPageKeyController {
  queries: TestingLibraryContext["queries"];
  constructor(
    private testingLibrary: TestingLibraryContext,
    private playwrightContext: PlaywrightContext
  ) {
    this.queries = testingLibrary.queries;
  }
  public async addKey(keyPair: {
    name: string;
    type: "Ed25519KeyPair2020";
    publicKeyMultibase: string;
    privateKeyMultibase: string;
  }) {
    const document = await this.testingLibrary.getDocument();
    assertTruthy(document);
    // click add key button
    await (await this.queries.getByText(document, "Add Item")).click();
    // find new form
    const nameInputs = await this.queries.queryAllByLabelText(document, "name");
    const nameInput = nameInputs[nameInputs.length - 1];
    // add name to form
    assertTruthy(nameInput);
    await nameInput.type(keyPair.name);

    const page = this.playwrightContext.page;
    assertTruthy(page);
    const typeInputsContainer = page
      .locator('*[data-testid="keypair-form-type"] .MuiInput-formControl')
      .last();
    // This should open the select menu
    await typeInputsContainer.click();
    // This should click the right entry in the menu options
    await page.locator(`li[data-value="${keyPair.type}"]`).click();
    const publicKeyInputs = await this.queries.queryAllByLabelText(
      document,
      "publicKeyMultibase *"
    );
    const lastPublicKeyInput = publicKeyInputs[publicKeyInputs.length - 1];
    assertTruthy(lastPublicKeyInput);
    await lastPublicKeyInput.type(keyPair.publicKeyMultibase);

    const privateKeyInputs = await this.queries.queryAllByLabelText(
      document,
      "privateKeyMultibase *"
    );
    const lastPrivateKeyInput = privateKeyInputs[privateKeyInputs.length - 1];
    assertTruthy(lastPrivateKeyInput);
    await lastPrivateKeyInput.type(keyPair.privateKeyMultibase);
  }
  public async getKeys() {
    const document = await this.testingLibrary.getDocument();
    assertTruthy(document);
    const keyPairForms = await this.queries.getAllByTestId(
      document,
      "keypair-form"
    );
    const keys = await Promise.all(
      keyPairForms.map(async (formEl) => {
        const key = {
          name: await (
            await this.queries.getByLabelText(formEl, "name")
          ).getAttribute("value"),
          publicKeyMultibase: await (
            await this.queries.getByLabelText(formEl, "publicKeyMultibase *")
          ).getAttribute("value"),
          privateKeyMultibase: await (
            await this.queries.getByLabelText(formEl, "privateKeyMultibase *")
          ).getAttribute("value"),
        };
        return key;
      })
    );
    return keys;
  }
  public async refresh() {
    const { page } = this.playwrightContext;
    assertTruthy(page);
    await page.reload();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
