import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

import type { IKey } from 'davatar-ui';
import { KeyList } from 'davatar-ui';
import * as tweetnacl from "tweetnacl";

const defaultProps: Parameters<typeof KeyList>[0] = {
    cryptoKeys: [],
};

export default {
  title: 'keys/KeyList',
  component: KeyList,
  args: {
      ...defaultProps,
  },
} as ComponentMeta<typeof KeyList>;

const Template: ComponentStory<typeof KeyList> = (args) => <KeyList {...args} />;

export const EmptyList = Template.bind({});

export const SingleKey = Template.bind({});
SingleKey.args = { cryptoKeys: [SampleKey()] };

export const ManyKeys = Template.bind({});
ManyKeys.args = {
    cryptoKeys: new Array(10).fill(0).map(() => SampleKey()),
};

function SampleKey(kid=`bengo-kid-${Math.random().toString().slice(2)}`): IKey {
    const keyPair = tweetnacl.sign.keyPair();
    return {
        kid,
        type: 'Ed25519',
        publicKeyHex: hexEncode(keyPair.publicKey),
    };
}

function hexEncode(bytes: Uint8Array): string {
    const hex = Array.from(bytes).map(b => b.toString(16)).join('');
    return hex;
}
