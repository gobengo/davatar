import * as React from "react";
import { Route, useLocation, useRouteMatch } from "react-router";

/**
 * React Component that helps test an OpenID Connect (i.e. OIDC) Provider
 */
export function OidcTester(props: {
    authorizationEndpoint: string
}) {
    const { path } = useRouteMatch();
    const sendAuthenticationRequestUrl = React.useMemo(() => {
        const state = {
            redirect_uri: '/oidc-tester/redirect_uri',
        };
        const redirect_uri = withoutLocationHash(location.toString()).toString();
        console.log('OidcTester', { redirect_uri });
        const request = {
            response_type: 'id_token',
            redirect_uri,
            state: JSON.stringify(state),
        };
        const sendAuthenticationRequestUrl = new URL(props.authorizationEndpoint);
        for (const [key, value] of Object.entries(request)) {
            sendAuthenticationRequestUrl.searchParams.set(key, value);
        }
        return sendAuthenticationRequestUrl.toString();
    }, [props.authorizationEndpoint]);
    return <>
        <h1>OidcTester</h1>
        <div data-testid="oidc-tester" />
        <a href={sendAuthenticationRequestUrl}>Authenticate</a>
        <Route path={`${path}/redirect_uri`}>
            <RedirectUriHandler />
        </Route>
    </>;
}

function RedirectUriHandler() {
    const location = useLocation();
    const hashParams = React.useMemo(() => new URLSearchParams(location.hash.replace(/^#/, '')), [location.hash]);
    const hashParamsObj = React.useMemo(() => Object.fromEntries(hashParams.entries()), [hashParams]);
    return <>
        <h2>AuthenticationResponse</h2>
        <pre>{JSON.stringify(hashParamsObj, null, 2)}</pre>
    </>;
}

function withoutLocationHash(urlIn: URL|string): URL {
    const url = new URL(urlIn.toString());
    url.hash = '';
    return url;
}
