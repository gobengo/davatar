import * as React from "react"
import { useLocation } from "react-router"
import * as assert from "assert";
import { Link } from "react-router-dom";

class AuthenticationRequest {
    constructor(
        public response_type: string,
        public client_id: string,
        public redirect_uri: string,
        public scope: string,
        public state: string,
        public nonce: string,
    ) {}

    static fromUrl(searchParams: URLSearchParams) {
        return new AuthenticationRequest(
            searchParams.get('response_type') || '',
            searchParams.get('client_id') || '',
            searchParams.get('redirect_uri') || '',
            searchParams.get('scope') || '',
            searchParams.get('state') || '',
            searchParams.get('nonce') || '',
        );
    }
}

function AuthenticationRequestReceiverScreen() {
    const location = useLocation()
    const authenticationRequest = AuthenticationRequest.fromUrl(new URLSearchParams(location.search))
    return <>
    AuthenticationRequestReceiverScreen
    <pre>{JSON.stringify(authenticationRequest, null, 2)}</pre>
    <Link to="/">Home</Link>
    </>
}

export default AuthenticationRequestReceiverScreen
