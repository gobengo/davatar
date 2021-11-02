import { base64url } from 'jose';
import type { Ed25519JWKPublicKey } from './jwk-ed25519';
import { base58btc } from 'multiformats/bases/base58';

export const SUITE_ID = 'Ed25519VerificationKey2020';
// multibase base58-btc header
export const MULTIBASE_BASE58BTC_HEADER = 'z';
// multicodec ed25519-pub header as varint
export const MULTICODEC_ED25519_PUB_HEADER = new Uint8Array([0xed, 0x01]);
// multicodec ed25519-priv header as varint
export const MULTICODEC_ED25519_PRIV_HEADER = new Uint8Array([0x80, 0x26]);

export async function createDidKeyDid(jwk: Ed25519JWKPublicKey) {
    const publicKey = base64url.decode(jwk.x);
    const mbKey = _encodeMbKey(MULTICODEC_ED25519_PUB_HEADER, publicKey);
    const did = `did:key:${mbKey}`;
    return did;
}

// encode a multibase base58-btc multicodec key
function _encodeMbKey(header: Uint8Array, key: Uint8Array) {
    const mbKey = new Uint8Array(header.length + key.length);
  
    mbKey.set(header);
    mbKey.set(key, header.length);
  
    return base58btc.encode(mbKey);
  }