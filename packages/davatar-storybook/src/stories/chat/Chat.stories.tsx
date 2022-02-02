import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type {
  IChatParticipant,
  IChatState,
  IChatActions,
  IChatMessage,
  IChatMessageContent,
} from "davatar-ui";
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
      mediaType: "text/plain" as const,
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
  const [chat, actions] = useChatState();
  return (
    <>
      <ChatActionButtons {...actions} />
      <div>
        <h1>Mutable Chat</h1>
        <Chat {...args} {...chat} {...actions} />
      </div>
    </>
  );
};
export const Mutable = MutableTemplate.bind({});

function useChatState(): [IChatState, IChatActions & IStorybookChatActions] {
  const [participants, setParticipants] = React.useState(
    [] as IChatParticipant[]
  );
  const addRandomParticipant = React.useCallback(
    () =>
      setParticipants((oldParticipants) => [
        ...oldParticipants,
        createRandomParticipant(),
      ]),
    [setParticipants]
  );
  const [messages, setMessages] = React.useState([] as IChatMessage[]);
  const addRandomMessage = React.useCallback(
    () =>
      setMessages((oldMessages) => [
        ...oldMessages,
        ...createRandomMessages(1, { name: "bengo" }),
      ]),
    [setMessages]
  );
  const onMessage: IChatActions["onMessage"] = React.useCallback(
    (content: IChatMessageContent) => {
      if (!participants.length) {
        addRandomParticipant();
      }
      const participant = participants[0];
      const newMessage: IChatMessage = {
        id: createEphemeralId(),
        attributedTo: participant,
        ...content,
      };
      setMessages((oldMessages) => [...oldMessages, newMessage]);
    },
    [setMessages, participants, addRandomParticipant]
  );
  const actions = React.useMemo(() => {
    return {
      addRandomMessage,
      addRandomParticipant,
      onMessage,
    };
  }, [addRandomParticipant, addRandomMessage, onMessage]);
  const chatState = React.useMemo(() => {
    return { participants, messages };
  }, [participants, messages]);
  return [chatState, actions];
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const NChats = (props: {}) => {
  const [chatCount, setChatCount] = React.useState(2);
  const chatCountInputRef = React.useRef<HTMLInputElement | null>(null);
  const onChangeChatCount = React.useCallback(() => {
    const value = chatCountInputRef.current?.value;
    if (typeof value === "undefined") return;
    const valueParsed = parseInt(value, 10);
    if (isNaN(valueParsed)) return;
    setChatCount(valueParsed);
  }, []);
  const [chatState, actions] = useChatState();
  const SingleChat = () => <Chat {...chatState} {...actions} />;
  return (
    <>
      <h1>N Chats</h1>
      <ChatActionButtons {...actions} />
      <div>
        <label>Chat Count</label>
        <input
          name="chatCount"
          onChange={onChangeChatCount}
          ref={chatCountInputRef}
          type="number"
          step="1"
          min="1"
          value={chatCount}
        />
      </div>
      <br />
      <FlexColumns count={chatCount} Child={SingleChat} />
    </>
  );
};

function FlexColumns(props: { count: number; Child: () => JSX.Element }) {
  const { Child } = props;
  return (
    <>
      <div style={{ display: "flex" }}>
        {new Array(props.count).fill(undefined).map((chat, index) => (
          <div key={index} style={{ flex: "1 1 auto" }}>
            <Child />
          </div>
        ))}
      </div>
    </>
  );
}

interface IStorybookChatActions {
  addRandomMessage: () => void;
  addRandomParticipant: () => void;
}

function ChatActionButtons(props: IStorybookChatActions) {
  return (
    <div>
      <button onClick={props.addRandomParticipant}>Add Participant</button>
      <button onClick={props.addRandomMessage}>Add Message</button>
    </div>
  );
}

export const WithInput = () => {
  const [chatState, actions] = useChatState();
  return (
    <>
      <h1>With Input</h1>
      <Chat {...chatState} {...actions} />
    </>
  );
};
