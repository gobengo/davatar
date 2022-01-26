import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type { AddressLocation, JSONDatetime, PlannableEvent } from "davatar-ui";
import { YTextEditor } from "davatar-ui";
import { EventPlanner } from "davatar-ui";
import { Y } from "@syncedstore/core";
import { syncedStore, getYjsValue } from "@syncedstore/core";
import { useSyncedStore } from "@syncedstore/react";

import { WebrtcProvider } from "y-webrtc";
import { EventHomePage } from "davatar-ui/src/event-planner/EventHomePage";
import styled from "styled-components";

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

function MutableEventReducer(
  state: MutableEventState,
  action: Action
): MutableEventState {
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

function makeValidEvent(
  input: Partial<PlannableEvent>,
  template?: Partial<PlannableEvent>,
  suggestedOutput?: Partial<PlannableEvent>
): PlannableEvent {
  const output = suggestedOutput || Object.create(input);
  if (!input.id) {
    output.id = template?.id || createIdString();
  }
  if (!input.name) {
    output.name = template?.name || `Event id=${input.id}`;
  }
  if (!input.description) {
    output.description = template?.description || "";
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
  if (!input.subEvents) {
    output.subEvents = template?.subEvents || [];
  }
  return output as PlannableEvent;
}

export const Collaboration: ComponentStory<typeof EventPlanner> = (args) => {
  const numPeers = 2;
  React.useEffect(() => {
    const yjsDoc = getYjsValue(collaborationStore);
    if (!yjsDoc) {
      throw new Error("failed to getYjsValue from syncedStore");
    }
    const provider = new WebrtcProvider(
      "davatar-storybook-event-planner-collaboration",
      yjsDoc as Y.Doc
    );
    return () => {
      return provider.destroy();
    };
  }, [collaborationStore]);
  const state = useSyncedStore(collaborationStore);
  const yjsDoc = getYjsValue(state);
  const eventYjsDoc = getYjsValue(state.event);
  const eventDescriptionYjsDoc = getYjsValue(state.event.description);
  console.log("collaboration yjsDoc", {
    yjsDoc,
    eventYjsDoc,
    eventDescriptionYjsDoc,
  });
  const addEvent = React.useCallback(() => {
    const { event } = state;
    if (event.subEvents) {
      event.subEvents.push(IIW34ClosingCeremony());
    }
  }, [event]);
  const fullEvent = React.useMemo(() => {
    return makeValidEvent(state.event, undefined);
  }, [state.event]);
  const onClickSetToIIW = React.useCallback(() => {
    Object.assign(state.event, IIW34());
  }, [makeValidEvent, state.event, IIW34]);
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

const singleEventStore = syncedStore({
  name: "text",
  description: "text",
});

class YjsPlannableEvent implements PlannableEvent {
  docs: {
    beginning: Y.Map<unknown>;
    end: Y.Map<unknown>;
    description: Y.Text;
    id: Y.Text;
    name: Y.Text;
    location: {
      name: Y.Text;
      address: Y.Text;
      city: Y.Text;
      zip: Y.Text;
    };
    organizers: Y.Array<Y.Doc>;
    subEvents: Y.Array<Y.Doc>;
  };
  constructor(options: { yjsDoc: Y.Doc }) {
    const { yjsDoc } = options;
    const end = yjsDoc.getMap("end");
    const beginning = yjsDoc.getMap("beginning");
    const location = options.yjsDoc.getMap("location");
    const locationName = new Y.Text();
    location.set("name", locationName);
    const locationAddress = new Y.Text();
    location.set("address", locationAddress);
    const locationCity = new Y.Text();
    location.set("city", locationCity);
    const locationZip = new Y.Text();
    location.set("zip", locationZip);
    const organizers = new Y.Array<Y.Doc>();
    const subEvents = new Y.Array<Y.Doc>();
    this.docs = {
      id: yjsDoc.getText("id"),
      name: yjsDoc.getText("name"),
      description: yjsDoc.getText("description"),
      beginning,
      end,
      location: {
        name: locationName,
        address: locationAddress,
        city: locationCity,
        zip: locationZip,
      },
      organizers,
      subEvents,
    };
  }
  get description() {
    const yText = this.docs.name;
    if (yText) return yText.toJSON() || "";
    return "";
  }
  get name() {
    const yText = this.docs.name;
    if (yText) return yText.toJSON() || "";
    return "";
  }
  get id() {
    const yText = this.docs.id;
    if (yText) return yText.toJSON() || "";
    return "";
  }
  get beginning(): JSONDatetime {
    const yMap = this.docs.beginning;
    const iso8601 = yMap?.get("iso8601");
    return {
      iso8601: yjsIso8601ToString(iso8601),
    };
  }
  get end(): JSONDatetime {
    const yMap = this.docs.end;
    const iso8601 = yMap?.get("iso8601");
    return {
      iso8601: yjsIso8601ToString(iso8601),
    };
  }
  get location(): AddressLocation {
    return {
      name: this.docs.location.name?.toJSON(),
      address: this.docs.location.address.toJSON(),
      city: this.docs.location.city.toJSON(),
      zip: this.docs.location.zip.toJSON(),
    };
  }
  get organizers(): Array<{ name: string }> {
    const yDoc = this.docs.organizers;
    return yDoc.map((organizerYjsDoc) => {
      return {
        name: organizerYjsDoc.getText("name").toJSON(),
      };
    });
  }
  get subEvents(): Array<YjsPlannableEvent> {
    const yjsDoc = this.docs.subEvents;
    return yjsDoc.map(
      (subEventYjsDoc) => new YjsPlannableEvent({ yjsDoc: subEventYjsDoc })
    );
  }
}

function yjsIso8601ToString(iso8601: unknown): string {
  if (typeof iso8601 === "undefined") {
    return new Date().toISOString();
  }
  if (iso8601 instanceof Y.Text) {
    return iso8601.toJSON();
  }
  console.warn("unexpted iso8601", iso8601);
  throw new Error("unexpected type of iso8601");
}

const StyleFix = styled("div")`
& h1 {
  display: block;
  margin: initial;
}
`;

export const EditingEventDescription: ComponentStory<typeof EventPlanner> = (
  args
) => {
  const numPeers = 2;
  const state = useSyncedStore(singleEventStore);
  React.useEffect(() => {
    if (!state.name.toJSON()) {
      state.name.insert(0, "Amazing Event Name");
    }
    if (!state.description.toJSON()) {
      state.description.insert(
        0,
        "This event really will be one of the most amazing things of all time. It even has a great description here."
      );
    }
  }, []);
  const event = React.useMemo(() => {
    const yjsDoc = getYjsValue(state);
    if (!(yjsDoc instanceof Y.Doc)) {
      throw new Error("failed to getYjsDoc");
    }
    const event = new YjsPlannableEvent({
      yjsDoc,
    });
    return event;
  }, [state]);
  return (
    <StyleFix>
      <div style={{ display: "flex" }}>
        {new Array(numPeers).fill(0).map((e, index) => {
          return (
            <div
              key={index}
              style={{
                overflowX: "auto",
                flex: "1 1 auto",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {/* <pre>{JSON.stringify(state, null, 2)}</pre>
              <dl>
                  <dt>name</dt><dd>
                    <YTextEditor text={state.name} />
                  </dd>
                  <dt>description</dt><dd>
                    <YTextEditor text={state.description} />
                  </dd>
              </dl> */}
              <EventHomePage event={event} yjsDocs={event.docs} />
            </div>
          );
        })}
      </div>
    </StyleFix>
  );
};
