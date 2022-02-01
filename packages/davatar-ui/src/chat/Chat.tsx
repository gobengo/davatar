import * as React from "react";

export interface IChatParticipant {
  id?: string;
  name: string;
}

export interface IChatMessage {
  id: string;
  attributedTo: IChatParticipant;
  content: string;
  mediaType: string;
}

export interface IChatState {
  participants: IChatParticipant[];
  messages: Array<Promise<IChatMessage> | IChatMessage>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const Chat = function (props: IChatState) {
  return (
    <>
      <strong>Participants</strong>
      <ul>
        {props.participants.map((participant, index) => (
          <li key={participant.id || index}>{participant.name}</li>
        ))}
      </ul>
      <strong>Messages</strong>
      <ul>
        {props.messages.map((message, index) => (
          <li key={"id" in message ? message.id : index}>
            <Message message={message} />
          </li>
        ))}
      </ul>
    </>
  );
};

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
