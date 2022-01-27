
/**
 * Cryptographic key type
 * @public
 * @attributedTo https://github.com/uport-project/veramo/blob/6b1d135eedb1c58b715be8941d34312da39facb2/packages/core/src/types/IIdentifier.ts#L51
 */
 export type TKeyType = 'Ed25519' | 'Secp256k1' | 'X25519'

 /**
  * Cryptographic key
  * @public
  * @attributedTo https://github.com/uport-project/veramo/blob/6b1d135eedb1c58b715be8941d34312da39facb2/packages/core/src/types/IIdentifier.ts#L57
  */
 export interface IKey {
   /**
    * Key ID
    */
   kid: string
 
   /**
    * Key type
    */
   type: TKeyType
 
   /**
    * Public key
    */
   publicKeyHex: string
 
   /**
    * Optional. Private key
    */
   privateKeyHex?: string
 }
 