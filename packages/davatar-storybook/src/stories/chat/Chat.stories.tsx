import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type { IChatParticipant, IChatMessage } from "davatar-ui";
import { Chat } from "davatar-ui";
import * as didMethodKey from "@digitalbazaar/did-method-key";

const bengo: IChatParticipant = {
  name: "bengo",
};

function createEphemeralId(): string {
  return Math.random().toString().slice(2);
}

function createRandomMessages(
  count: number,
  participant: IChatParticipant
): Array<IChatMessage> {
  const messages = new Array(count).fill(undefined).map((_, index) => {
    return {
      id: createEphemeralId(),
      attributedTo: participant,
      mediaType: "text/plain",
      content: `I am message #${index} in a series by ${participant.name}`,
    };
  });
  return messages;
}

function createRandomParticipant(): IChatParticipant {
  return { name: createEphemeralId(), id: createEphemeralId() };
}

const defaultProps: Parameters<typeof Chat>[0] = {
  participants: [bengo],
  messages: [...createRandomMessages(10, bengo)],
};

export default {
  title: "chat/Chat",
  component: Chat,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof Chat>;

const Template: ComponentStory<typeof Chat> = (args) => {
  return <Chat {...args} />;
};

export const DefaultProps = Template.bind({});

const MutableTemplate: ComponentStory<typeof Chat> = (args) => {
  const [participants, setParticipants] = React.useState(
    [] as IChatParticipant[]
  );
  const addParticipant = React.useCallback(
    () =>
      setParticipants((oldParticipants) => [
        ...oldParticipants,
        createRandomParticipant(),
      ]),
    [setParticipants]
  );
  const [messages, setMessages] = React.useState([] as IChatMessage[]);
  const addMessage = React.useCallback(
    () =>
      setMessages((oldMessages) => [
        ...oldMessages,
        ...createRandomMessages(1, { name: "bengo" }),
      ]),
    [setMessages]
  );
  return (
    <>
      <div>
        <button onClick={addParticipant}>Add Participant</button>
        <button onClick={addMessage}>Add Message</button>
      </div>
      <div>
        <h1>Mutable Chat</h1>
        <Chat {...args} {...{ participants, messages }} />
      </div>
    </>
  );
};
export const Mutable = MutableTemplate.bind({});
