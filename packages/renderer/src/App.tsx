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
import { JsonStorage, KeyedLocalstorage } from "./modules/storage";
import type { IStorage } from "./modules/storage";
import SettingsService from "./modules/service-settings";
import { OidcTester } from "./modules/oidc-tester";
import WhoamiScreen from "./modules/screen-whoami";
import type { IAuthenticationState} from "./modules/authentication-react";
import { AuthenticationContext} from "./modules/authentication-react";
import { AuthenticationProvider} from "./modules/authentication-react";
import { DefaultAuthenticationState} from "./modules/authentication-react";
import ProfilesScreen from "./modules/screen-profiles";

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
  }, [onOpenUrl]);
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
      if (hashParams.get('type') === 'AuthenticationResponseForwarded') {
        // this has already been forwarded by this AuthenticationResponseRouter. Don't handle again.
        return;
      }
      if ( ! idToken) {
        // this is not a response
        return;
      }
      if (stateRedirectUri) {
        const authResponseForwardParams = new URLSearchParams(hashParams.toString());
        authResponseForwardParams.set('type', 'AuthenticationResponseForwarded');
        const finalUrl = `${stateRedirectUri}#${authResponseForwardParams.toString()}`;
        history.push(finalUrl);
      }
    },
    [stateRedirectUri, idToken, hashParams, history],
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
    [onAppControlMessage],
  );
  return { latestMessageEvent };
}

function AppControlMessageHandler() {
  const history = useHistory();
  const { latestMessageEvent } = useAppControlMessages();
  React.useEffect(
    () => {
      if ( ! latestMessageEvent) {
        return;
      }
      switch(latestMessageEvent.type) {
        case "Navigate":
          history.push(latestMessageEvent.payload.href);
          break;
        case "NavigateToOidcTester":
          console.log('App handling NavigateToOidcTester control message by history.push /oidc-tester');
          history.push('/oidc-tester');
          break;
        default:
          // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
          const x: never = latestMessageEvent;
      }
    },
    [latestMessageEvent, history],
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
  const authenticationStorage: IStorage<IAuthenticationState> = JsonStorage(KeyedLocalstorage({
    localStorage,
    key: 'authentication',
  }));
  const storedAuthenticationState: IAuthenticationState|undefined = React.useMemo(
    () => {
      const readResult = authenticationStorage.read();
      return readResult.value;
    },
    [authenticationStorage],
  );
  const initialAuthenticationState: IAuthenticationState|null = React.useMemo(
    () => {
      return storedAuthenticationState || DefaultAuthenticationState();
    },
    [storedAuthenticationState]
  );
  const storedSettings = settingsStorage.read();
  const settingsService = new SettingsService({
    json: storedSettings.exists ? storedSettings.value : undefined,
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
  const oidcTesterClientKeyPair = React.useMemo(() => tweetnacl.sign.keyPair(), []);
  const oidcTesterClientPublicKeyJwk = React.useMemo(() => ed25519PublicKeyJWK(oidcTesterClientKeyPair), [oidcTesterClientKeyPair]);
  return (
    <>
      <div data-test-id="davatar-renderer-app"></div>
      <div data-testid="davatar-renderer-app"></div>
      <AuthenticationProvider
        initialAuthenticationState={initialAuthenticationState}
        onChange={(state) => { authenticationStorage.write(state); }}
        >
      <HashRouter>
        <AuthenticationStateStorer
          storedAuthenticationState={storedAuthenticationState}
          storage={authenticationStorage}
          />
        <AuthenticationResponseRouter />
        <AppControlMessageHandler />
        <AuthenticationRequestRouter />
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
              registration={{
                application_type: 'native',
                client_name: 'Davatar OidcTester',
                logo_uri: 'https://i.pravatar.cc/128',
                client_uri: location.toString(),
                jwks: {keys:[oidcTesterClientPublicKeyJwk]},
              }}
              />
          </Route>
          <Route path="/whoami">
            <WhoamiScreen />
          </Route>
          <Route exact path="/profiles">
              <ProfilesScreen />
          </Route>
        </Switch>
        <footer>
          <hr />
          <Link to="/">Home</Link>
          <Link to="/oidc-tester">OidcTester</Link>
          <Link to="/whoami">whoami</Link>
          <Link to="/profiles">Profiles</Link>
        </footer>
      </HashRouter>
      </AuthenticationProvider>
    </>
  );
}

function AuthenticationStateStorer(props: {
  storedAuthenticationState: IAuthenticationState | undefined
  storage: IStorage<IAuthenticationState>
}) {
  const authenticationContext = React.useContext(AuthenticationContext);
  React.useEffect(
    () => {
      if (props.storedAuthenticationState === authenticationContext.state) {
        console.debug('AuthenticationStateStorer handling initial. Will not store.');
        return;
      }
      console.debug('AuthenticationStateStorer writing', authenticationContext.state);
      props.storage.write(authenticationContext.state);
    },
    [authenticationContext.state, props.storedAuthenticationState, props.storage]
  );
  return <></>;
}

export default App;
