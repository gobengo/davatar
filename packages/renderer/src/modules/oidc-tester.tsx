import { base64url } from "jose";
import * as React from "react";
import { Route, useLocation, useRouteMatch } from "react-router";
import { assertTruthy } from "./assert";
import { useAuthentication } from "./authentication-react";
import type {
  AuthenticationRequest,
  ClientRegistration} from "./openid-connect";
import {
  standardClaims,
} from "./openid-connect";
import { AuthenticationResponse } from "./openid-connect";

/**
 * React Component that helps test an OpenID Connect (i.e. OIDC) Provider
 */
export function OidcTester(props: {
  authorizationEndpoint: string;
  registration: Pick<
    ClientRegistration,
    "application_type" | "client_name" | "logo_uri" | "client_uri" | "jwks"
  >;
}) {
  const { path } = useRouteMatch();
  const redirect_uri = React.useMemo(
    () => withoutLocationHash(location.toString()).toString(),
    [location.toString()]
  );
  const sendAuthenticationRequestUrl = React.useMemo(() => {
    const state = {
      redirect_uri: "/oidc-tester/redirect_uri",
    };
    const registration: ClientRegistration = {
      ...props.registration,
      redirect_uris: [redirect_uri],
      // #TODO don't use 'none'. It's not allowed in did-siop https://identity.foundation/did-siop/#generate-siop-request
      request_object_signing_alg: "none",
      response_types: ["id_token"],
      grant_types: ["implicit"],
    };
    const request: AuthenticationRequest = {
      response_type: "id_token",
      redirect_uri,
      state: JSON.stringify(state),
      client_id: redirect_uri,
      scope: "openid did_authn profile",
      nonce: Math.random().toString().slice(2),
      registration,
    };
    const sendAuthenticationRequestUrl = new URL(props.authorizationEndpoint);
    for (const [key, value] of Object.entries(request)) {
      const valueStr =
        typeof value === "string" ? value : JSON.stringify(value);
      sendAuthenticationRequestUrl.searchParams.set(key, valueStr);
    }
    return sendAuthenticationRequestUrl.toString();
  }, [props.authorizationEndpoint, redirect_uri]);
  const claimsEnabled = {
    email: true,
  };
  return (
    <>
      <div data-testid="oidc-tester" />
      <h1>OidcTester</h1>
      <p>Use this form to initiate OIDC Authentication</p>
      <div>
        <h2>Claims</h2>
        <p>
          Check the box for each claim you wish to request in the
          AuthenticationRequest
        </p>
        <form>
          {standardClaims.map((claim) => (
            <div key={claim}>
              <input
                id={`claim_${claim}`}
                type="checkbox"
                name={`claims.${claim}`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                defaultChecked={(claimsEnabled as any)[claim] ?? false}
                />
              <label htmlFor={`claim_${claim}`}>{claim}</label>
            </div>
          ))}
          <div>
            <label>given_name</label>
          </div>
        </form>
      </div>
      <br />
      <a href={sendAuthenticationRequestUrl}>Authenticate</a>
      <Route path={`${path}/redirect_uri`}>
        <RedirectUriHandler />
      </Route>
    </>
  );
}

function RedirectUriHandler() {
  const authentication = useAuthentication();
  const location = useLocation();
  const hashParams = React.useMemo(
    () => new URLSearchParams(location.hash.replace(/^#/, "")),
    [location.hash]
  );
  const authenticationResponse = React.useMemo(() => {
    try {
      return AuthenticationResponse.fromUrl(
        new URLSearchParams(location.hash.replace(/^#/, ""))
      );
    } catch (error) {
      console.debug(
        "error creating AuthenticationResponse fromUrl. Ignoring.",
        error
      );
    }
  }, [location.hash]);
  React.useEffect(() => {
    if (authenticationResponse) {
      authentication.actions.handleAuthenticationResponse(
        authenticationResponse
      );
      // authentication.response = authenticationResponse;
    }
  }, [authenticationResponse]);
  const hashParamsObj = React.useMemo(
    () => Object.fromEntries(hashParams.entries()),
    [hashParams]
  );
  const idTokenClaims = React.useMemo(() => {
    const id_token = hashParamsObj.id_token;
    assertTruthy(id_token);
    return JSON.parse(
      new TextDecoder().decode(base64url.decode(id_token.split(".")[1]))
    );
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
