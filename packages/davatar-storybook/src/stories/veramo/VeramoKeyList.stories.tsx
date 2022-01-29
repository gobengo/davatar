import * as React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";

import type { IKey } from "davatar-ui";
import { KeyList } from "davatar-ui";
import * as tweetnacl from "tweetnacl";
import type { ManagedKeyInfo } from "@veramo/core";
import { KeyManagementSystem } from "@veramo/kms-local";
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';

export default {
  title: "veramo/VeramoKeyList",
  component: VeramoKeyList,
} as ComponentMeta<typeof VeramoKeyList>;

const Template: ComponentStory<typeof VeramoKeyList> = (args) => {
  return (
    <>
      <VeramoKeyList {...args} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
    count: 10,
};

// eslint-disable-next-line @typescript-eslint/ban-types
function VeramoKeyList(props: {
    count: number
}) {
  const [needsKmsFetch, setNeedsKmsFetch] = React.useState(true);
  const [keys, setKeys] = React.useState<ManagedKeyInfo[]>([]);
  const [kms] = React.useState(() => new KeyManagementSystem(new MemoryPrivateKeyStore()));
  // With a new kms, create initial keys
  const createCountKeys = React.useCallback(
      () => {
          (async () => {
              const created = await Promise.all(new Array(props.count).fill(0).map(async () => kms.createKey({ type: "Ed25519" })));
              setNeedsKmsFetch(true);
            })();
      },
      [kms, props.count],
  );
  React.useEffect(
    () => {
        (async () => {
          const keys = await kms.listKeys();
          setKeys(keys);
          setNeedsKmsFetch(false);
        })();
    },
    [needsKmsFetch],
  );
  const createEd25519Key = React.useCallback(
      () => {
        (async () => {
          await kms.createKey({ type: "Ed25519" });
          setNeedsKmsFetch(true);
        })();
      },
      [kms],
  );
  return (
    <>
      <button onClick={createCountKeys}>Create {props.count} keys</button>
      <KeyList cryptoKeys={keys} createKey={createEd25519Key}></KeyList>
    </>
  );
}
