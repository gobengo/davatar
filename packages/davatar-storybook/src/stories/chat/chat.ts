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


export function createEphemeralId(): string {
    return Math.random().toString().slice(2);
  }
  
  export function createRandomMessages(
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
  
  export function createRandomParticipant(): IChatParticipant {
    return { name: createEphemeralId(), id: createEphemeralId() };
  }

  
export function useChatState() {
    const [events, setEvents] = React.useState([] as Array<INameChange>);
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
    const onMessage = React.useCallback(
      (newMessage: IChatMessage) => {
        setMessages((oldMessages) => [...oldMessages, newMessage]);
      },
      [setMessages]
    );
    const updateParticipant = React.useCallback(
      (updatedParticipant: IChatParticipant) => {
        const existingParticipantIndex = updatedParticipant.id
          ? participants.findIndex((p) => p.id === updatedParticipant.id)
          : -1;
        const updatedParticipants = [...participants];
        const isUpdate = Boolean(existingParticipantIndex >= 0);
        console.log("updateParticipant isUpdate", isUpdate);
        if (isUpdate) {
          // update
          updatedParticipants[existingParticipantIndex] = {
            ...updatedParticipant,
          };
        } else {
          // add
          updatedParticipants.push(updatedParticipant);
        }
        setParticipants(updatedParticipants);
        if (isUpdate) {
          const nameChangeEvent: INameChange = {
            type: "NameChange",
            object: updatedParticipants[existingParticipantIndex],
            prev: participants[existingParticipantIndex],
          };
          setEvents((oldEvents) => [...oldEvents, nameChangeEvent]);
        }
      },
      [participants]
    );
    const actions = React.useMemo(() => {
      return {
        addRandomMessage,
        addRandomParticipant,
        onMessage,
        updateParticipant,
      };
    }, [addRandomParticipant, addRandomMessage, onMessage, updateParticipant]);
    const chatState: IChatState = React.useMemo(() => {
      return { participants, messages, events };
    }, [participants, messages, events]);
    const ret = [chatState, actions] as [IChatState, typeof actions];
    return ret;
  }
  