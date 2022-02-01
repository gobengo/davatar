import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import type { IChatParticipant, IChatMessage } from 'davatar-ui';
import { Chat } from 'davatar-ui';
import * as didMethodKey from '@digitalbazaar/did-method-key';

const bengo: IChatParticipant = {
    name: 'bengo',
};

async function createEphemeralId(): Promise<string> {
    return Math.random().toString().slice(2);
}

function createRandomMessages(count: number, participant: IChatParticipant): Array<IChatMessage | Promise<IChatMessage>> {
    const messages = (new Array(count)).fill(undefined).map(
        async (_, index) => {
            return {
                id: await createEphemeralId(),
                attributedTo: participant,
                mediaType: 'text/plain',
                content: `I am message #${index} in a series by ${participant.name}`,
            };
        },
    );
    return messages;
}

const defaultProps: Parameters<typeof Chat>[0] = {
    participants: [
        bengo,
    ],
    messages: [
        ...createRandomMessages(10, bengo),
    ],
};

export default {
  title: 'chat/Chat',
  component: Chat,
  args: {
      ...defaultProps,
  },
} as ComponentMeta<typeof Chat>;

const Template: ComponentStory<typeof Chat> = (args) => {
    return <Chat {...args} />;
};

export const DefaultProps = Template.bind({});
