/* eslint-disable @typescript-eslint/no-unused-vars */
import { binding, given, then, when } from 'cucumber-tsflow';
import { assert } from 'chai';
import { ElectronAppContext } from '../contexts/ElectronAppContext';
import TestingLibraryContext from '../contexts/TestingLibraryContext';
import SettingsPageKeyController from '../pages/SettingsPageKeyController';
import PlaywrightContext from '../contexts/PlaywrightContext';
import { assertTruthy } from '../../../packages/renderer/src/modules/assert';
import type { Page } from 'playwright-core';
import OidcTesterPageController from '../pages/OidcTesterPageController';
import { base64url, calculateJwkThumbprint } from 'jose';
const fetch = require('node-fetch').default;
// import fetch from 'node-fetch';

@binding([
    ElectronAppContext,
    TestingLibraryContext,
    PlaywrightContext,
])
export class OpenIDConnectSteps {
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

    @given('the user has navigated to OIDC Tester')
    public async givenTheUserHasNavigatedToOidcTester() {
        const app = this.electronAppContext.app;
        assertTruthy(app);
        await app.evaluate(async E => {
            const mainWindow = E.BrowserWindow.getAllWindows()[0];
            mainWindow.webContents.send('davatar', {
                type: 'NavigateToOidcTester',
            });
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    @then('the user sees the OIDC Tester')
    public async thenTheUSerSeesTheOIDCTester() {
        const pageController = new OidcTesterPageController(this.testingLibrary);
        assert.equal(await pageController.isRendered(), true);
    }

    @when('the user initiates authentication')
    public async whenTheUserInitiatesAuthentication() {
        const pageController = new OidcTesterPageController(this.testingLibrary);
        await pageController.authenticate();
    }

    @then('the user sees the authentication flow')
    public async thenTheUserSeesTheAuthFlow() {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const testid = await this.testingLibrary.queries.getByTestId(document, 'AuthenticationRequestReceiverScreen');
        assert.equal(Boolean(testid), true);
    }

    protected async readAuthenticationResponse() {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const idTokenEl = await this.testingLibrary.queries.getByTestId(document, 'AuthenticationResponse');
        assert.equal(Boolean(idTokenEl), true);
        const authResponseString = await idTokenEl.innerHTML();
        const authResponse = JSON.parse(authResponseString);
        return authResponse;
    }

    @then('the user sees an AuthenticationResponse')
    public async thenTheUserSeesAnAuthenticationResponse() {
        const authResponse = await this.readAuthenticationResponse();
    }

    @then('the user sees an id_token')
    public async thenTheUserSeesAnIdToken() {
        const authResponse = await this.readAuthenticationResponse();
        const id_token = authResponse?.id_token;
        assert.ok(id_token);
        const idTokenClaims = parseIdTokenClaims(authResponse.id_token);
        assert.ok(idTokenClaims);
    }

    @then('the id_token is self-issued')
    public async thenTheIdTokenIsSelfIssued() {
        const authResponse = await this.readAuthenticationResponse();
        const claims = parseIdTokenClaims(authResponse.id_token);
        assert.equal(claims.iss, 'https://self-issued.me');
    }

    @then('the id_token has a did claim')
    public async thenTheIdTokenHasADidClaim() {
        const authResponse = await this.readAuthenticationResponse();
        const claims = parseIdTokenClaims(authResponse.id_token);
        const didClaim: string|undefined = claims.did;
        assert.ok(didClaim);
        assert.ok(didClaim?.match(/^did:/));
    }

    @then('the id_token has sub and sub_jwk claims')
    public async thenTheIdTokenHasSubAndSubJwkClaims() {
        const authResponse = await this.readAuthenticationResponse();
        const claims = parseIdTokenClaims(authResponse.id_token);
        assert.ok(claims.sub);
        assert.ok(claims.sub_jwk);
        assert.equal(claims.sub, await calculateJwkThumbprint(claims.sub_jwk), 'sub is jose fingerprint of sub_jwk');
    }

    @when('the user authorizes authentication')
    public async whenTheUserAuthorizesAuthentication() {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const authButton = await this.testingLibrary.queries.getByText(document, 'Authenticate');
        await authButton.click();
    }

    @when('the app receives an AuthenticationRequest')
    public async whenAppReceivesAuthenticationRequest() {
        const page = await this.electronAppContext.app?.firstWindow();
        assertTruthy(page);
        const pageUrlString = await page.url();
        assertTruthy(pageUrlString);
        const pageUrl = new URL(pageUrlString);
        const authnRequestUrl = `openid://?type=AuthenticationRequest&response_type=id_token`;
        // const authnRequestUrl = withAuthenticationRequest(pageUrl);
        console.log('authnRequestUrl', authnRequestUrl.toString());
        const app = this.electronAppContext.app;
        assertTruthy(app);
        // not sure this really works
        await app.evaluate((options, [authnRequestUrl]) => {
            const win = options.BrowserWindow.getAllWindows()[0];
            console.log('test send open-url', authnRequestUrl);
            
            win.webContents.send('open-url', authnRequestUrl);
        }, [authnRequestUrl]);
        // const response = await sendAuthenticationRequest(page, authnRequestUrl.toString());
        // console.log({ response });
    }
}

function withAuthenticationRequest(urlIn: URL) {
    const url = new URL(urlIn.toString());
    url.searchParams.set('type', 'AuthenticationRequest');
    url.searchParams.set('response_type', 'id_token');
    return url;
}

function parseIdTokenClaims(idToken: string) {
    const idTokenClaims = JSON.parse((new TextDecoder).decode(base64url.decode(idToken.split('.')[1])));
    return idTokenClaims;
}
