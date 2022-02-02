import * as React from "react";

export interface IChatParticipant {
  id?: string;
  name: string;
}

export interface IChatMessage {
  id: string;
  attributedTo: IChatParticipant;
  content: string;
  mediaType: 'text/plain';
}

export interface IChatState {
  participants: IChatParticipant[];
  messages: Array<Promise<IChatMessage> | IChatMessage>;
}

export type IChatMessageContent = Omit<IChatMessage, 'id'|'attributedTo'>

export interface IChatActions {
    onMessage?(action: IChatMessageContent): void;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const Chat = function (props: IChatState & IChatActions) {
  return (
    <>
      <header>
        <strong>Participants</strong>
      </header>
      <ul>
        {props.participants.map((participant, index) => (
          <li key={participant.id || index}>{participant.name}</li>
        ))}
      </ul>
      <header>
        <strong>Messages</strong>
      </header>
      <ul>
        {props.messages.map((message, index) => (
          <li key={"id" in message ? message.id : index}>
            <Message message={message} />
          </li>
        ))}
      </ul>
      {props.onMessage ? <>
      <header>
          <strong>Add a Message</strong>
      </header>
        <PlaintextMessageForm onMessage={props.onMessage} />
      </> : <></>}
    </>
  );
};

function PlaintextMessageForm(props: {
    onMessage(content: IChatMessageContent): void;
}) {
    const messageTextRef = React.useRef<HTMLInputElement|null>(null);
    const onFormSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const messageText = messageTextRef?.current?.value;
            if (typeof messageText !== 'string') {
                throw new Error('failed to read messageText from PlaintextMessageForm messageTextRef');
            }
            const content: IChatMessageContent = {
                mediaType: 'text/plain' as const,
                content: messageText,
            };
            props.onMessage(content);
            if (messageTextRef.current) {
              messageTextRef.current.value = '';
            }
        },
        [props],
    );
    return <>
        <form onSubmit={onFormSubmit}>
            <input type="text" name="messageText" ref={messageTextRef} />
            <input type="submit" />
        </form>
    </>;
}

export const Message = function (props: {
  message: IChatMessage | Promise<IChatMessage>;
}) {
  const [message, setMessage] = React.useState<IChatMessage | null>(null);
  React.useEffect(() => {
    Promise.resolve(props.message).then(setMessage);
  }, [props.message]);
  if (!message) {
    return <>'Loading&hellip;'</>;
  }
  return <>{message?.content}</>;
};
