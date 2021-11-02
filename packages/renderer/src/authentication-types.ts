import type { Ed25519JWKPublicKey } from './modules/jwk-ed25519';

export interface AuthenticationSubject {
    id: string,
    signer: {
        jwk: Ed25519JWKPublicKey,
        sign(data: ArrayBuffer): Promise<ArrayBuffer>
    }
}
