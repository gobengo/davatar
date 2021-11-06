import * as React from "react";
import { HashRouter, Link, Route, Switch, useHistory, useLocation } from "react-router-dom";
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
    React.useState<URL | undefined>();
  const { onOpenUrl } = useElectron();
  React.useEffect(() => {
    const subscription = onOpenUrl((url) => {
      setLatestOpenUrlEvent(new URL(url));
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
    const openedUrl = openUrlEvent;
    function isSIOPAuthenticationRequest(url: URL) {
      return url.searchParams.get("response_type") && url.searchParams.get('redirect_uri');
    }
    if (isSIOPAuthenticationRequest(openedUrl)) {
      console.log('isSIOP request', true);
      const searchParams = new URLSearchParams(
        Array.from(openedUrl.searchParams.entries()),
      );
      const authenticationRequestUrl = `/authentication-request?${searchParams.toString()}`;
      history.push(authenticationRequestUrl);
    }
  }, [openUrlEvent, history]);
  return <></>;
}

type ParsedState = {
  redirect_uri?: string;
}

/**
 * Handle oidc AuthenticationResponse
 */
function AuthenticationResponseRouter() {
  const history = useHistory();
  const routerLocation = useLocation();
  console.log('routerLocation', routerLocation);
  const hashParams = React.useMemo(() => new URLSearchParams(routerLocation.search), [routerLocation.search]);
  const idToken = React.useMemo(() => hashParams.get('id_token'), [hashParams]);
  const stateString = React.useMemo(
    () => {
      const stateString = hashParams.get('state');
      return stateString;
    },
    [hashParams],
  );
  const stateObj = React.useMemo(
    () => {
      if ( ! stateString) {
        return;
      }
      let stateObj: unknown;
      try {
        stateObj = stateString && JSON.parse(stateString);
      } catch (error) {
        console.debug('error parsing potential AuthenticationResponse state. Ignoring because its most likely this isnt an AuthenticationResponse', stateString);
      }
      return stateObj;
    },
    [stateString],
  );
  const stateRedirectUri = React.useMemo(
    () => {
      if (stateObj && (typeof (stateObj as ParsedState).redirect_uri === 'string')) {
        const redirect_uri = (stateObj as ParsedState).redirect_uri;
        return redirect_uri;
      }
    },
    [stateObj],
  );
  React.useEffect(
    () => {
      console.log('AuthenticationResponseRouter effect', { stateRedirectUri, idToken });
      if ( ! idToken) {
        // this is not a response
        return;
      }
      if (stateRedirectUri) {
        const paramsWithoutState = new URLSearchParams(Array.from(hashParams.entries()).filter((entry) => {
          const [key] = entry;
          if (key === 'state') { return false; }
          return true;
        }));
        const finalUrl = `${stateRedirectUri}#${paramsWithoutState.toString()}`;
        console.log('routing AuthenticationResponse to ', finalUrl);
        history.push(finalUrl);
      }
    },
    [stateRedirectUri, idToken],
  );
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
        setLatestMessageEvent(message);
      }
      const { unsubscribe } = onAppControlMessage(listener);
      return () => {
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
        <AuthenticationResponseRouter />
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
          <Route path="/oidc-tester">
            <OidcTester
              authorizationEndpoint="openid:"
              />
          </Route>
        </Switch>
        <footer>
          <hr />
          <Link to="/">Home</Link>
          <Link to="/oidc-tester">OidcTester</Link>
        </footer>
      </HashRouter>
    </>
  );
}

export default App;
