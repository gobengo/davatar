import * as React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";

import type { IIdentifier} from "davatar-ui";
import { DidBrowser, IKey } from "davatar-ui";
import { KeyList } from "davatar-ui";
import * as tweetnacl from "tweetnacl";
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { KeyDIDProvider } from '@veramo/did-provider-key';
import { KeyManagementSystem } from "@veramo/kms-local";
import type { IDIDManager, IKeyManager , IResolver} from '@veramo/core';
import { createAgent, IDataStore } from '@veramo/core';
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as webDidResolver } from 'web-did-resolver';

export default {
  title: "veramo/VeramoDidBrowser",
  component: VeramoDidBrowser,
} as ComponentMeta<typeof VeramoDidBrowser>;

const Template: ComponentStory<typeof VeramoDidBrowser> = (args) => {
  return (
    <>
      <VeramoDidBrowser {...args} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
    count: 10,
};

// eslint-disable-next-line @typescript-eslint/ban-types
function VeramoDidBrowser(props: {
    count: number
}) {
  const [needsFetch, setNeedsFetch] = React.useState(true);
  const [dids, setDids] = React.useState<IIdentifier[]>([]);
  const [kms] = React.useState(() => new KeyManagementSystem(new MemoryPrivateKeyStore()));
  const [didManager] = React.useState(() => {
      return new DIDManager({
          providers: {
              'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:key',
      });
  });
  const veramoAgent = React.useMemo(
      () => {
          return createAgent<IKeyManager & IDIDManager & IResolver>({
              plugins: [
                  new KeyManager({
                      store: new MemoryKeyStore(),
                      kms: {
                          local: new KeyManagementSystem(new MemoryPrivateKeyStore),
                      },
                  }),
                  didManager,
                  new DIDResolverPlugin({
                    resolver: new Resolver({
                      // ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
                      ...webDidResolver(),
                    }),
                  }),
              ],
          });
      },
      [didManager],
  );
  React.useEffect(
    () => {
        (async () => {
          const dids = await didManager.didManagerFind({});
          setNeedsFetch(false);
          setDids(dids);
        })();
    },
    [needsFetch, didManager],
  );
  const createDid = React.useCallback(
      () => {
        (async () => {
          await veramoAgent.didManagerCreate({});
          setNeedsFetch(true);
        })();
      },
      [veramoAgent],
  );
  return (
    <>
      <DidBrowser dids={dids} createDid={createDid}></DidBrowser>
    </>
  );
}
