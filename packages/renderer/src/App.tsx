import * as React from "react";
import {
  HashRouter,
  Route,
  useHistory,
  useLocation,
} from "react-router-dom";
import { AuthenticationSubject } from "./authentication-types";
import AuthenticationRequestReceiverScreen from "./components/AuthenticationRequestReceiverScreen";
import { useElectron } from "./use/electron";
import * as didJwt from "did-jwt";
import { ed25519PublicKeyJWK } from "./modules/jwk-ed25519";
import * as tweetnacl from "tweetnacl";

function Home() {
  return <>WIP: Home Page {location.pathname}</>;
}

function RouteInfo() {
  const location = useLocation();
  return (
    <>
      <p>Location: {location.pathname}</p>
    </>
  );
}

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
        Array.from(openedUrl.searchParams.entries())
      );
      const authenticationRequestUrl = `/authentication-request?${searchParams.toString()}`;
      history.push(authenticationRequestUrl);
    }
  }, [openUrlEvent, history]);
  return <></>;
}

async function Ed25519KeySigner(
  keyPair: tweetnacl.SignKeyPair
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

function App() {
  const [authenticationSubject, setAuthenticationSubject] =
    React.useState<AuthenticationSubject>();
  React.useEffect(() => {
    if (!authenticationSubject) {
      (async () => {
        const keyPair = tweetnacl.sign.keyPair();
        const signer = await Ed25519KeySigner(keyPair);
        setAuthenticationSubject({
          id: "did:web:bengo.co",
          signer,
        });
      })();
    }
  }, [authenticationSubject]);
  return (
    <>
      <header>
        <h1>davatar</h1>
      </header>
      <HashRouter>
        <AuthenticationRequestRouter />
        {/* <RouteInfo /> */}
        <Route exact path="/" component={Home} />
        <Route exact path="/authentication-request">
          {authenticationSubject && (
            <AuthenticationRequestReceiverScreen
              authenticationSubject={authenticationSubject}
            />
          )}
        </Route>
      </HashRouter>
    </>
  );
}

export default App;
