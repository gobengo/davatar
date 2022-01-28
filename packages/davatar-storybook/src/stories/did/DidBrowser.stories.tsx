import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";

import type { IIdentifier, IKey } from "davatar-ui";
import { DidBrowser } from "davatar-ui";
import * as tweetnacl from "tweetnacl";
import Multibase from "multibase";
import Multicodec from "multicodec";
import { MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';

const defaultProps: Parameters<typeof DidBrowser>[0] = {
  dids: [],
};

export default {
  title: "did/DidBrowser",
  component: DidBrowser,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof DidBrowser>;

const Template: ComponentStory<typeof DidBrowser> = (args) => {
  return <DidBrowser {...args} />;
};

export const EmptyList = Template.bind({});

export const Single = Template.bind({});
Single.args = { dids: [SampleDid()] };

export const Many = Template.bind({});
Many.args = {
    dids: new Array(10).fill(0).map(() => SampleDid()),
};

const WithStateTemplate: ComponentStory<typeof DidBrowser> = (args) => {
    const [dids, setDids] = React.useState<Array<IIdentifier>>([]);
    const createDid = React.useCallback(
        async () => {
            setDids([
                await SampleDid(),
                ...dids,
            ]);
        },
        [dids, setDids],
    );
    return <DidBrowser dids={dids} createDid={createDid} />;
  };

export const Addable = WithStateTemplate.bind({});

async function SampleDid(
  alias = `bengo-did-${Math.random().toString().slice(2)}`
): Promise<IIdentifier> {
  const kms = new KeyManagementSystem(new MemoryPrivateKeyStore);
  const key = await kms.createKey({ type: "Ed25519" });
  const multibaseBytes = Multibase.encode(
    "base58btc",
    Multicodec.addPrefix("ed25519-pub", hexToBytes(key.publicKeyHex))
  );
  const methodSpecificId = (new TextDecoder).decode(multibaseBytes);

  const identifier: Omit<IIdentifier, "provider"> = {
    did: "did:key:" + methodSpecificId,
    controllerKeyId: key.kid,
    keys: [key],
    services: [],
  };
  return identifier;
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array((hex.match(/.{1,2}/g) || []).map(byte => parseInt(byte, 16)));
    return bytes;
}
