import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import type { ICredentialCreator, ISelfCredentialCreatorProps } from 'davatar-ui';
import { SelfCredentialCreator } from 'davatar-ui';
import * as tweetnacl from "tweetnacl";
import { hexEncode } from '../keys/KeyList.stories';

type CredentialSubject = { name: string };
const defaultCreateCredential: ICredentialCreator<CredentialSubject> = async (options) => {
    return {
        credentialSubject: options.credentialSubject,
    };
};

const defaultProps: ISelfCredentialCreatorProps<CredentialSubject> = {
    createCredential: defaultCreateCredential,
};

export default {
  title: 'self-credentials/SelfCredentialCreator',
  component: SelfCredentialCreator,
  args: {
      ...defaultProps,
  },
} as ComponentMeta<typeof SelfCredentialCreator>;

const Template: ComponentStory<typeof SelfCredentialCreator> = (args) => {
    return <SelfCredentialCreator {...args} />;
};

export const DefaultProps = Template.bind({});
