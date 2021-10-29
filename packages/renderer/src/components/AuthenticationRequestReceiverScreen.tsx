import * as React from "react"
import { useLocation } from "react-router"
import { Link } from "react-router-dom";
import * as tweetnacl from "tweetnacl";
import * as didJwt from "did-jwt";
import {JWK, base64url, calculateJwkThumbprint} from "jose";

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

interface AuthenticationResponse {
    state: string
    id_token: string
}
function createSendResponseUrl(
    authenticationRequest: AuthenticationRequest,
    authenticationResponse: AuthenticationResponse,
): URL {
    let sendResponseUri = new URL(authenticationRequest.redirect_uri)
    const responseSearchParams = new URLSearchParams
    for (const [k,v] of Object.entries(authenticationResponse)) {
        responseSearchParams.set(k,v)
    }
    sendResponseUri.hash = responseSearchParams.toString()
    return sendResponseUri
}

function respondToAuthenticationRequest(
    req: AuthenticationRequest,
    id_token: string,
): AuthenticationResponse {
    return {
        state: req.state,
        id_token,
    }
}

type EpochSecondsDatetime = number

interface IdTokenClaims {
    iss: string
    sub: string
    aud: string
    exp: EpochSecondsDatetime
    iat: EpochSecondsDatetime
    nonce?: string
}

type Signer = (data: ArrayBuffer) => Promise<ArrayBuffer>

// ex https://github.com/panva/jose/blob/6de381213d552e798d9dfa007d4bd08918b0320e/test-cloudflare-workers/cloudflare.test.mjs#L272
function ed25519JWK(keyPair: tweetnacl.SignKeyPair): JWK {
    const jwk: JWK = {
        kty: 'OKP',
        crv: 'Ed25519',
        x: base64url.encode(keyPair.publicKey),
        d: base64url.encode(keyPair.secretKey),
    }
    return jwk; 
}

async function createIdToken(
    claims: IdTokenClaims,
): Promise<string> {
    const keyPair = tweetnacl.sign.keyPair()
    const signer = didJwt.EdDSASigner(keyPair.secretKey)
    const jwk = ed25519JWK(keyPair)
    const jwkThumbprint = await calculateJwkThumbprint(jwk)
    const jwt = didJwt.createJWT(
        {...claims, sub: jwkThumbprint},
        { issuer: claims.iss, signer },
        { alg: 'EdDSA'}
    )
    return jwt
}

function AuthenticationRequestReceiverScreen() {
    const location = useLocation()
    const authenticationRequest = React.useMemo(
        () => AuthenticationRequest.fromUrl(new URLSearchParams(location.search)),
        [location.search],
    )
    type Identity = { id: string }
    const currentSubjectKeyPair = tweetnacl.sign.keyPair()
    const currentSubject: Identity & {sign:Signer} = {
        id: 'did:web:bengo.co',
        async sign(data) {
            const signer = didJwt.EdDSASigner(currentSubjectKeyPair.secretKey)
            const sig1 = await signer(new Uint8Array(data))
            if (typeof sig1 !== 'string') { throw new Error('unexpected sig1 ')}
            const sig2 = (new TextEncoder).encode(sig1)
            return sig2
        }
    }
    const [idToken, setIdToken] = React.useState<string>()
    React.useEffect(
        () => {
            (async () => {
                const idToken: string = await createIdToken({
                    iss: "https://self-issued.me/v2",
                    aud: authenticationRequest.client_id,
                    iat: Number(new Date),
                    exp: Number(new Date) + (60 * 5), // 5 minutes
                    sub: currentSubject.id,
                    nonce: authenticationRequest.nonce,
                })
                setIdToken(idToken)
            })()
        },
        [authenticationRequest.client_id, authenticationRequest.nonce]
    )

    const sendResponseUrl = idToken && createSendResponseUrl(
        authenticationRequest,
        respondToAuthenticationRequest(authenticationRequest, idToken)
    )
    return <>
    AuthenticationRequestReceiverScreen
    <pre>{JSON.stringify(authenticationRequest, null, 2)}</pre>

    <h2>respond</h2>
    <ul>
        <li>
            id_token: {idToken}
            <ul>
                <li>id_token claims<pre>{idToken && JSON.stringify(didJwt.decodeJWT(idToken), null, 2)}</pre></li>
            </ul>
        </li>
        {sendResponseUrl && <>
            <li>url: <a target="_blank" href={sendResponseUrl.toString()}>{sendResponseUrl.toString()}</a></li>        
        </>}
    </ul>

    <Link to="/">Home</Link>
    </>
}

export default AuthenticationRequestReceiverScreen
