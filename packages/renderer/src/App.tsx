import * as React from "react";
import { HashRouter, Link, Route, Switch, useHistory } from "react-router-dom";
import type { AuthenticationSubject } from "./authentication-types";
import AuthenticationRequestReceiverScreen from "./components/AuthenticationRequestReceiverScreen";
import { useElectron } from "./use/electron";
import * as didJwt from "did-jwt";
import { ed25519PublicKeyJWK } from "./modules/jwk-ed25519";
import * as tweetnacl from "tweetnacl";
import DavatarHomeScreen from "./modules/davatar-screen-home";
import DavatarSettingsScreen from "./modules/davatar-screen-settings";
import { createDidKeyDid } from "./modules/did-key-ed25519";
import { KeyedLocalstorage } from "./modules/storage";
import SettingsService from "./modules/service-settings";
import { OidcTester } from "./modules/oidc-tester";

function useOpenUrlEvents() {
  const [latestOpenUrlEvent, setLatestOpenUrlEvent] =
    React.useState<string | undefined>();
  const { onOpenUrl } = useElectron();
  React.useEffect(() => {
    const subscription = onOpenUrl((url) => {
      setLatestOpenUrlEvent(url);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return latestOpenUrlEvent;
}

function AuthenticationRequestRouter() {
  const history = useHistory();
  const openUrlEvent = useOpenUrlEvents();
  React.useEffect(() => {
    if (!openUrlEvent) {
      return;
    }
    const openedUrl = new URL(openUrlEvent);
    function isSIOPAuthenticationRequest(url: URL) {
      return url.searchParams.get("response_type");
    }
    if (isSIOPAuthenticationRequest(openedUrl)) {
      const searchParams = new URLSearchParams(
        Array.from(openedUrl.searchParams.entries()),
      );
      const authenticationRequestUrl = `/authentication-request?${searchParams.toString()}`;
      history.push(authenticationRequestUrl);
    }
  }, [openUrlEvent, history]);
  return <></>;
}

async function Ed25519KeySigner(
  keyPair: tweetnacl.SignKeyPair,
): Promise<AuthenticationSubject["signer"]> {
  return {
    jwk: ed25519PublicKeyJWK(keyPair),
    async sign(data: ArrayBuffer) {
      const djSigner = didJwt.EdDSASigner(keyPair.secretKey);
      const sigString = await djSigner(new Uint8Array(data));
      if (typeof sigString !== "string") {
        throw new Error("unexpected sigString ");
      }
      const sigBytes = new TextEncoder().encode(sigString);
      return sigBytes;
    },
  };
}

function useAppControlMessages() {
  const {onAppControlMessage} = useElectron();
  const [latestMessageEvent, setLatestMessageEvent] = React.useState<AppControlMessage>();
  React.useEffect(
    () => {
      function listener(message: AppControlMessage) {
        console.log('onAppControlMessage listener', message);
        setLatestMessageEvent(message);
      }
      const { unsubscribe } = onAppControlMessage(listener);
      return () => {
        console.log('useAppControlMessages unsubscribing');
        unsubscribe();
      };
    },
    [],
  );
  return { latestMessageEvent };
}

function AppControlMessageHandler() {
  const history = useHistory();
  const { latestMessageEvent } = useAppControlMessages();
  React.useEffect(
    () => {
      console.log('latestMessageEvent', latestMessageEvent);
      switch(latestMessageEvent?.type) {
        case "NavigateToOidcTester":
          console.log('App handling NavigateToOidcTester control message by history.push /oidc-tester');
          history.push('/oidc-tester');
          break;
      }
    },
    [latestMessageEvent],
  );
  return <></>;
}

function App() {
  const [authenticationSubject, setAuthenticationSubject] =
    React.useState<AuthenticationSubject>();
  const settingsStorage = KeyedLocalstorage({
    localStorage,
    key: 'settings',
  });
  const settingsService = new SettingsService({
    json: settingsStorage.read() ?? undefined,
    onChange: (s) => {
      settingsStorage.write(JSON.stringify(s));
    },
  });
  React.useEffect(() => {
    if (!authenticationSubject) {
      (async () => {
        const keyPair = tweetnacl.sign.keyPair();
        const signer = await Ed25519KeySigner(keyPair);
        setAuthenticationSubject({
          id: await createDidKeyDid(ed25519PublicKeyJWK(keyPair)),
          signer,
        });
      })();
    }
  }, [authenticationSubject]);
  return (
    <>
      <div data-test-id="davatar-renderer-app"></div>
      <div data-testid="davatar-renderer-app"></div>
      <HashRouter>
        <AppControlMessageHandler />
        <AuthenticationRequestRouter />
        {/* <RouteInfo /> */}
        <Switch>
          <Route exact path="/">
            <DavatarHomeScreen />
          </Route>
          <Route exact path="/authentication-request">
            {authenticationSubject && (
              <AuthenticationRequestReceiverScreen
                authenticationSubject={authenticationSubject}
              />
            )}
          </Route>
          <Route exact path="/settings">
            <DavatarSettingsScreen
              initialSettings={settingsService.settings}
              onSettingsChange={s => { console.debug('DavatarSettingsScreen onSettingsChange saving to storage', s); settingsService.save(s); }} />
          </Route>
          <Route exact path="/oidc-tester">
            <OidcTester />
          </Route>
        </Switch>
        <footer>
          <hr />
          <Link to="/">Home</Link>
        </footer>
      </HashRouter>
    </>
  );
}

export default App;
