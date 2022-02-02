import * as React from "react";
import { useLocation } from "react-router";
import * as didJwt from "did-jwt";
import { calculateJwkThumbprint } from "jose";
import type { AuthenticationSubject } from "../authentication-types";
import type { Ed25519JWKPublicKey } from "../modules/jwk-ed25519";
import { createDidKeyDid } from "../modules/did-key-ed25519";
import type {
  AuthenticationResponse,
  ClaimsDescriptor,
} from "../modules/openid-connect";
import { AuthenticationRequest } from "../modules/openid-connect";

function createSendResponseUrl(
  authenticationRequest: AuthenticationRequest,
  authenticationResponse: AuthenticationResponse
): URL {
  const sendResponseUri = new URL(authenticationRequest.redirect_uri);
  const responseSearchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(authenticationResponse)) {
    responseSearchParams.set(k, v);
  }
  sendResponseUri.hash = `?` + responseSearchParams.toString();
  return sendResponseUri;
}

function respondToAuthenticationRequest(
  req: AuthenticationRequest,
  id_token: string
): AuthenticationResponse {
  return {
    state: req.state,
    id_token,
  };
}

type EpochSecondsDatetime = number;

interface IdTokenClaims {
  iss: string;
  sub: string;
  aud: string;
  exp: EpochSecondsDatetime;
  iat: EpochSecondsDatetime;
  nonce?: string;
}

async function createIdToken(
  claims: IdTokenClaims & Record<string, unknown>,
  signer: {
    jwk: Ed25519JWKPublicKey;
    sign(data: ArrayBuffer): Promise<ArrayBuffer>;
  }
): Promise<string> {
  const jwkThumbprint = await calculateJwkThumbprint(signer.jwk);
  const kid: string = await createDidKeyDid(signer.jwk);
  const jwt = didJwt.createJWT(
    { ...claims, sub: jwkThumbprint, sub_jwk: { ...signer.jwk, kid } },
    {
      issuer: claims.iss,
      signer: async (data) => {
        const dataBytes =
          typeof data === "string" ? new TextEncoder().encode(data) : data;
        const sig = await signer.sign(dataBytes);
        return new TextDecoder().decode(sig);
      },
    },
    { alg: "EdDSA", kid }
  );
  return jwt;
}

function jwtDecode(jwt: string) {
  const [header, payload] = jwt
    .split(".")
    .slice(0, 2)
    .map((b) => {
      return JSON.parse(atob(b));
    });
  return { header, payload };
}

function AuthenticationRequestReceiverScreen(props: {
  authenticationSubject: AuthenticationSubject;
}) {
  const { authenticationSubject } = props;
  const [formClaims, setFormClaims] = React.useState<Record<string, unknown>>();
  const location = useLocation();
  const authenticationRequest = React.useMemo(
    () => AuthenticationRequest.fromUrl(new URLSearchParams(location.search)),
    [location.search]
  );
  const [idToken, setIdToken] = React.useState<string>();
  React.useEffect(() => {
    (async () => {
      const idToken: string = await createIdToken(
        {
          iss: "https://self-issued.me",
          aud: authenticationRequest.client_id,
          iat: Date.now() / 1000,
          exp: Date.now() / 1000 + 60 * 5, // 5 minutes
          sub: authenticationSubject.id,
          nonce: authenticationRequest.nonce,
          did: authenticationSubject.id,
          ...formClaims,
        },
        authenticationSubject.signer
      );
      setIdToken(idToken);
    })();
  }, [
    authenticationSubject.id,
    authenticationSubject.signer,
    authenticationRequest.client_id,
    authenticationRequest.nonce,
    formClaims,
  ]);
  const authenticationResponse =
    idToken && respondToAuthenticationRequest(authenticationRequest, idToken);
  const sendResponseUrl =
    authenticationResponse &&
    createSendResponseUrl(authenticationRequest, authenticationResponse);
  function sendAuthenticationResponse() {
    const sendResponseUrlString = sendResponseUrl?.toString();
    if (sendResponseUrlString) {
      console.log({ sendResponseUrlString });
      window.location.assign(sendResponseUrlString);
      // window.open(sendResponseUrlString);
    }
  }
  return (
    <>
      <div data-testid="AuthenticationRequestReceiverScreen"></div>
      {authenticationRequest.registration && (
        <>
          <div>
            <img width="128" height="128" src={authenticationRequest.registration.logo_uri} />
            <p>
              Authenticate for <a href={authenticationRequest.registration.client_uri} target="_blank">
                {authenticationRequest.registration.client_name}
              </a>
              ?
            </p>
          </div>
        </>
      )}
      {authenticationRequest.claims && (
        <>
          <form>
            <ClaimsFormInputs
              claims={authenticationRequest.claims.id_token || {}}
              onChange={(claims) => setFormClaims(claims)}
            />
          </form>
        </>
      )}
      <button onClick={sendAuthenticationResponse}>Authenticate</button>
      <details>
        <summary>Authentication Details</summary>
        <pre>
          {JSON.stringify(
            {
              request: authenticationRequest,
              response: authenticationResponse,
              idTokenDecoded: idToken && jwtDecode(idToken),
            },
            null,
            2
          )}
        </pre>
      </details>
    </>
  );
}

function ClaimsFormInputs(props: {
  claims: ClaimsDescriptor;
  onChange: (claims: Record<string, unknown>) => void;
}) {
  type ClaimsFormAction = {
    type: "changeClaim";
    claim: string;
    value: unknown;
  };
  const initialState = Object.entries(props.claims).reduce(
    (acc, [claimName]) => {
      acc[claimName] = "";
      return acc;
    },
    {} as Record<string, unknown>
  );
  const [state, dispatch] = React.useReducer(
    (state: Record<string, unknown>, action: ClaimsFormAction) => {
      const newState = {
        ...state,
        [action.claim]: action.value,
      };
      return newState;
    },
    initialState
  );
  React.useEffect(() => {
    props.onChange(state);
  }, [state, props]);
  return (
    <>
      <dl>
        {Object.entries(props.claims).map(([claimName]) => (
          <span key={claimName}>
            <dt>{claimName}</dt>
            <dd>
              <input
                type="text"
                name={claimName}
                value={String(state[claimName])}
                onChange={({ target }) =>
                  dispatch({
                    type: "changeClaim",
                    claim: claimName,
                    value: target.value,
                  })
                }
              ></input>
            </dd>
          </span>
        ))}
      </dl>
    </>
  );
}

export default AuthenticationRequestReceiverScreen;
