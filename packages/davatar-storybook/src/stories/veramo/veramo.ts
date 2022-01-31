import type { IDIDManager, IKeyManager, IResolver } from '@veramo/core';
import { createAgent } from '@veramo/core';

import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import type { KeyStore } from '@veramo/data-store';
import { KeyManagementSystem } from '@veramo/kms-local';
import type { ICredentialIssuer } from '@veramo/credential-w3c';
import { CredentialIssuer } from '@veramo/credential-w3c';
import { KeyDIDProvider } from '@veramo/did-provider-key';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';

export const veramoAgent = createAgent<IResolver & ICredentialIssuer & IDIDManager & IKeyManager>({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...webDidResolver(),
      }),
    }),
    new CredentialIssuer(),
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        local: new KeyManagementSystem(new MemoryPrivateKeyStore),
      },
    }),
    new DIDManager({
      providers: {
          'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
      },
      store: new MemoryDIDStore(),
      defaultProvider: 'did:key',
    }),
  ],
});
