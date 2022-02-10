import * as React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type {
  IChatParticipant,
  IChatState,
  IChatActions,
  IChatMessage,
  IChatMessageContent,
  INameChange,
} from "davatar-ui";
import { Chat } from "davatar-ui";
import { NameEditor } from "../../components/NameEditor";
import { createEphemeralId, createRandomMessages, useChatState } from "./chat";

const bengo: IChatParticipant = {
  name: "bengo",
};

const defaultProps: Parameters<typeof Chat>[0] = {
  participants: [bengo],
  messages: [...createRandomMessages(10, bengo)],
  events: [],
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

function FlexColumns(props: {
  count: number;
  Child: (props: { index: number }) => JSX.Element;
}) {
  const { Child } = props;
  return (
    <>
      <div style={{ display: "flex" }}>
        {new Array(props.count).fill(undefined).map((chat, index) => (
          <div key={index} style={{ flex: "1 1 auto" }}>
            <Child index={index} />
          </div>
        ))}
      </div>
    </>
  );
}

interface IStorybookChatActions {
  addRandomMessage: () => void;
  addRandomParticipant: () => void;
  updateParticipant(p: IChatParticipant): void;
}

function ChatActionButtons(
  props: Pick<
    IStorybookChatActions,
    "addRandomParticipant" | "addRandomMessage"
  >
) {
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

export const NameChanges = () => {
  const [chatState, actions] = useChatState();
  const [myParticipantId] = React.useState(createEphemeralId);
  const onSave = React.useCallback(
    (entity: { name: string }) => {
      actions.updateParticipant({
        id: myParticipantId,
        ...entity,
      });
    },
    [myParticipantId, actions]
  );
  return (
    <>
      <h1>Name Changes</h1>
      <h2>Your Profile</h2>
      <NameEditor onSave={onSave} />
      <h2>Chat</h2>
      <Chat {...chatState} {...actions} />
    </>
  );
};

const SingleParticipant = (props: {
  // participant id
  id: string;
  state: IChatState;
  updateParticipant: IStorybookChatActions["updateParticipant"];
  onMessageContent: IChatActions["onMessageContent"];
}) => {
  const onSaveName = React.useCallback(
    (entity: { name: string }) => {
      const update = {
        id: props.id,
        ...entity,
      };
      props.updateParticipant(update);
    },
    [props]
  );
  return (
    <>
      <header>
        <h2>Edit Participant</h2>
      </header>
      <NameEditor onSave={onSaveName}></NameEditor>
      <header>
        <h2>Chat</h2>
      </header>
      <Chat {...props.state} onMessageContent={props.onMessageContent} />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const NParticipants = (props: {}) => {
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
  const [columnIndexToParticipantId, setColumnIndexToParticipantId] =
    React.useState([] as string[]);
  React.useEffect(() => {
    setColumnIndexToParticipantId((oldParticipantIds) => {
      const newParticipantIds = [...oldParticipantIds];
      while (chatCount > newParticipantIds.length) {
        newParticipantIds.push(createEphemeralId());
      }
      return newParticipantIds;
    });
  }, [chatCount]);
  const Column = (props: { index: number }) => {
    const participantId = columnIndexToParticipantId[props.index];
    const onMessageContent = (content: IChatMessageContent): void => {
      const participant = chatState.participants.find(p => p.id === participantId);
      if ( ! participant) {
        console.warn('couldnt find chatState participant for id=', participantId, { chatState });
        return;
      }
      const message: IChatMessage = {
        id: createEphemeralId(),
        attributedTo: participant,
        ...content,
      };
      actions.onMessage(message);
    };
    return (
      <>
        <p>column={props.index}</p>
        <p>participant.id={columnIndexToParticipantId[props.index]}</p>
        <SingleParticipant
          onMessageContent={onMessageContent}
          updateParticipant={actions.updateParticipant}
          state={chatState}
          id={participantId}
        />
      </>
    );
  };
  return (
    <>
      <h1>N Participants</h1>
      <p>Each column below represents a distinct participant in the chat.</p>
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
      <FlexColumns count={chatCount} Child={Column} />
    </>
  );
};
