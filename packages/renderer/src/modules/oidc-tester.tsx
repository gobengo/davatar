import { base64url } from "jose";
import * as React from "react";
import { Route, useLocation, useRouteMatch } from "react-router";
import { assertTruthy } from "./assert";

interface AuthenticationRequest {
  response_type: 'id_token'
  redirect_uri: string
  state: string
  client_id: string
  scope: string
  nonce: string
}

/**
 * React Component that helps test an OpenID Connect (i.e. OIDC) Provider
 */
export function OidcTester(props: { authorizationEndpoint: string }) {
  const { path } = useRouteMatch();
  const sendAuthenticationRequestUrl = React.useMemo(() => {
    const state = {
      redirect_uri: "/oidc-tester/redirect_uri",
    };
    const redirect_uri = withoutLocationHash(location.toString()).toString();
    const request: AuthenticationRequest = {
      response_type: "id_token",
      redirect_uri,
      state: JSON.stringify(state),
      client_id: redirect_uri,
      scope: '',
      nonce: Math.random().toString().slice(2),
    };
    const sendAuthenticationRequestUrl = new URL(props.authorizationEndpoint);
    for (const [key, value] of Object.entries(request)) {
      sendAuthenticationRequestUrl.searchParams.set(key, value);
    }
    return sendAuthenticationRequestUrl.toString();
  }, [props.authorizationEndpoint]);
  return (
    <>
      <h1>OidcTester</h1>
      <div data-testid="oidc-tester" />
      <a href={sendAuthenticationRequestUrl}>Authenticate</a>
      <Route path={`${path}/redirect_uri`}>
        <RedirectUriHandler />
      </Route>
    </>
  );
}

function RedirectUriHandler() {
  const location = useLocation();
  const hashParams = React.useMemo(
    () => new URLSearchParams(location.hash.replace(/^#/, "")),
    [location.hash]
  );
  const hashParamsObj = React.useMemo(
    () => Object.fromEntries(hashParams.entries()),
    [hashParams]
  );
  const idTokenClaims = React.useMemo(() => {
    const id_token = hashParamsObj.id_token;
    assertTruthy(id_token);
    return JSON.parse((new TextDecoder).decode(base64url.decode(id_token.split('.')[1])));
  }, [hashParamsObj?.id_token]);
  return (
    <>
      <h2>AuthenticationResponse</h2>
      <pre data-testid="AuthenticationResponse">
        {JSON.stringify(hashParamsObj, null, 2)}
      </pre>
      <h2>id_token claims</h2>
      <pre>{JSON.stringify(idTokenClaims, null, 2)}</pre>
    </>
  );
}

function withoutLocationHash(urlIn: URL | string): URL {
  const url = new URL(urlIn.toString());
  url.hash = "";
  return url;
}
