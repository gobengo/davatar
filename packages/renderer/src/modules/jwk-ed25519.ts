import { base64url } from 'jose';
import type * as tweetnacl from 'tweetnacl';

export type Ed25519JWKPublicKey = {
    kty: 'OKP',
    crv: 'Ed25519',
    x: string
}


// ex https://github.com/panva/jose/blob/6de381213d552e798d9dfa007d4bd08918b0320e/test-cloudflare-workers/cloudflare.test.mjs#L272
export function ed25519PublicKeyJWK(keyPair: tweetnacl.SignKeyPair): Ed25519JWKPublicKey {
    const jwk: Ed25519JWKPublicKey = {
        kty: 'OKP' as const,
        crv: 'Ed25519' as const,
        x: base64url.encode(keyPair.publicKey),
    };
    return jwk; 
}