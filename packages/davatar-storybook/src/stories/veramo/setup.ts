import type { IResolver } from '@veramo/core';
import { createAgent } from '@veramo/core';

import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import type { KeyStore } from '@veramo/data-store';
import { MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';

export const agent = createAgent<IResolver>({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        // ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
      }),
    }),
  ],
});

export function BrowserKeyStore() {
    return new MemoryKeyStore();
}

export function BrowserKms(): KeyManagementSystem {
    return new KeyManagementSystem(
        new MemoryPrivateKeyStore(),
    );
}
