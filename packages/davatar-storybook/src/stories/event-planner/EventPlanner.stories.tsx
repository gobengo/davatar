import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type { AddressLocation, JSONDatetime, PlannableEvent } from "davatar-ui";
import { EventPlanner } from "davatar-ui";
import type { Y } from "@syncedstore/core";
import { syncedStore, getYjsValue } from "@syncedstore/core";
import { useSyncedStore } from "@syncedstore/react";

import { WebrtcProvider } from "y-webrtc";

function createIdString(): string {
  return Math.random().toString().slice(2);
}

function ComputerHistoryMuseumLocation(): AddressLocation {
  return {
    name: "Computer History Museum",
    address: "1401 N Shoreline Blvd",
    city: "Mountain View, CA",
    zip: "94043",
  };
}

function IIWOrganizers() {
  return [
    { name: `Phil Windley` },
    { name: `Kaliya Young` },
    { name: `Doc Searls` },
  ];
}

function IIW34Keynote(): PlannableEvent {
  return {
    id: createIdString(),
    name: "IIW34 Keynote",
    description: "Welcome ceremony",
    beginning: { iso8601: "2022-04-26T15:00:00.000Z" },
    end: { iso8601: "2022-04-26T16:00:00.000Z" },
    location: ComputerHistoryMuseumLocation(),
    organizers: IIWOrganizers(),
    subEvents: [],
  };
}

function IIW34ClosingCeremony(): PlannableEvent {
  return {
    id: createIdString(),
    name: "IIW34 Closing Ceremony",
    description: "Closing ceremony",
    beginning: { iso8601: "2022-04-28T22:00:00.000Z" },
    end: { iso8601: "2022-04-28T23:00:00.000Z" },
    location: ComputerHistoryMuseumLocation(),
    organizers: IIWOrganizers(),
    subEvents: [],
  };
}

function IIW34(): PlannableEvent {
  return {
    id: createIdString(),
    name: "Internet Identity Workshop XXXIV (#34) 2022A",
    description:
      "The Internet Identity Workshop #IIW has been finding, probing and solving identity issues twice every year since 2005.",
    registration: {
      url: "https://www.eventbrite.com/e/internet-identity-workshop-iiwxxxiv-34-2022a-tickets-220922293527",
    },
    beginning: { iso8601: "2022-04-26T15:00:00.000Z" },
    end: { iso8601: "2022-04-28T23:00:00.000Z" },
    location: ComputerHistoryMuseumLocation(),
    organizers: IIWOrganizers(),
    subEvents: [IIW34Keynote(), IIW34ClosingCeremony()],
  };
}

const defaultProps: Parameters<typeof EventPlanner>[0] = {
  event: IIW34(),
};

export default {
  title: "Event Planner/EventPlanner",
  component: EventPlanner,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof EventPlanner>;

export const DefaultProps: ComponentStory<typeof EventPlanner> = (args) => {
  return <EventPlanner {...args} />;
};

type MutableEventState = {
  event: PlannableEvent;
};

function MutableEventStateInit(
  createInitialEvent: () => PlannableEvent
): MutableEventState {
  return {
    event: createInitialEvent(),
  };
}

enum MutableEventActionType {
  addEvent = "addEvent",
}

function MutableEventReducer(state: MutableEventState, action: Action): MutableEventState {
    console.log("Mutable reducing", { state, action });
    switch (action.type) {
      case MutableEventActionType.addEvent:
        // eslint-disable-next-line no-case-declarations
        const newEvent = IIW34ClosingCeremony();
        return {
          ...state,
          event: {
            ...state.event,
            subEvents: [...state.event.subEvents, newEvent],
          },
        };
        //   state.event.subEvents.push(newEvent);
        break;
      default:
        // eslint-disable-next-line no-case-declarations
        const x: never = action.type;
    }
    return state;
}

type Action = { type: MutableEventActionType.addEvent };

export const Mutable: ComponentStory<typeof EventPlanner> = (args) => {
  const [state, dispatch] = React.useReducer(
    MutableEventReducer,
    IIW34,
    MutableEventStateInit
  );
  const addEvent = React.useCallback(() => {
    dispatch({
      type: MutableEventActionType.addEvent,
    });
  }, [dispatch]);
  return <EventPlanner event={state.event} addEvent={addEvent} />;
};

const collaborationStore = syncedStore({
  event: {} as PlannableEvent,
});
const doc = getYjsValue(collaborationStore);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const webrtcProvider = new WebrtcProvider("davatar-storybook-event-planner-collaboration", doc as any);

function createJSONDatetime(date: Date): JSONDatetime {
    return { iso8601: date.toISOString() };
}

function makeValidEvent(input: Partial<PlannableEvent>, template?: Partial<PlannableEvent>, suggestedOutput?: Partial<PlannableEvent>): PlannableEvent {
  const output = suggestedOutput || Object.create(input);
  if (!input.id) {
    output.id = template?.id || createIdString();
  }
  if (!input.name) {
    output.name = template?.name || `Event id=${input.id}`;
  }
  if (!input.organizers) {
    output.organizers = template?.organizers || [];
  }
  if (!input.beginning) {
    output.beginning = template?.beginning || createJSONDatetime(new Date());
  }
  if (!input.end) {
    output.end = template?.end || createJSONDatetime(new Date());
  }
  if (!input.location) {
    output.location = template?.location || ComputerHistoryMuseumLocation();
  }
  if ( ! input.subEvents) {
    output.subEvents = template?.subEvents || [];
  }
  return output as PlannableEvent;
}

export const Collaboration: ComponentStory<typeof EventPlanner> = (args) => {
  const numPeers = 2;
  const [providerDidSync, setProviderDidSync] = React.useState(false);
  React.useEffect(
    () => {
        const yjsDoc = getYjsValue(collaborationStore);
        if ( ! yjsDoc) {
            throw new Error('failed to getYjsValue from syncedStore');
        }
        console.log('Collaboration yjsDoc', yjsDoc);
        const provider = new WebrtcProvider(
            'davatar-storybook-event-planner-collaboration',
            yjsDoc as Y.Doc,
        );
        provider.on('synced', () => {
            console.log('BEN PROVIDER SYNCED');
            setProviderDidSync(true);
        });
        provider.on('peers', () => {
            console.log('BEN PROVIDER PEERS');
            setProviderDidSync(true);
        });
        return () => {
            return provider.destroy();
        };
    },
    [collaborationStore],
  );
  const state = useSyncedStore(collaborationStore);
  React.useEffect(
      () => {
          if (providerDidSync) {
              console.log('provider did sync!', JSON.stringify(state.event));
          }
      },
      [providerDidSync, state],
  );
  console.log({ providerDidSync });
  const [collaborationProvider, setCollaborationProvider] = React.useState(null);
  const addEvent = React.useCallback(
      () => {
          const { event } = state;
          if (event.subEvents) {
            event.subEvents.push(IIW34ClosingCeremony());
          }
      },
      [event],
  );
  console.log('collaborationStore.event', JSON.stringify(collaborationStore.event));
  const fullEvent = React.useMemo(
      () => {
          return makeValidEvent(state.event, undefined);
      },
      [state.event],
  );
  const onClickSetToIIW = React.useCallback(
      () => {
          Object.assign(state.event, IIW34());
        //   console.log('setting state.event to values from IIW34');
        //   makeValidEvent(state.event, IIW34(), state.event);
      },
      [makeValidEvent, state.event, IIW34],
  );
  return (
    <>
      <button onClick={onClickSetToIIW}>Set to IIW34</button>
      <div style={{ display: "flex" }}>
        {new Array(numPeers).fill(0).map((e, index) => {
          return (
            <div key={index} style={{ flexGrow: 1 }}>
              <EventPlanner event={fullEvent} addEvent={addEvent} />
            </div>
          );
        })}
      </div>
    </>
  );
};
