import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type { AddressLocation, PlannableEvent  } from "davatar-ui";
import { EventPlanner  } from "davatar-ui";

function createIdString(): string {
    return Math.random().toString().slice(2);
}

function ComputerHistoryMuseumLocation(): AddressLocation {
    return {
        name: 'Computer History Museum',
        address: '1401 N Shoreline Blvd',
        city: 'Mountain View, CA',
        zip: '94043',
    };
}

function IIWOrganizers() {
    return [
        { name: `Phil Windley` },
        { name: `Kaliya Young`},
        { name: `Doc Searls` },
    ];
}

function IIW34Keynote(): PlannableEvent {
    return {
        id: createIdString(),
        name: 'IIW34 Keynote',
        description: 'Welcome ceremony',
        beginning: new Date(Date.parse('2022-04-26T15:00:00.000Z')),
        end: new Date(Date.parse('2022-04-26T16:00:00.000Z')),
        location: ComputerHistoryMuseumLocation(),
        organizers: IIWOrganizers(),
        subEvents: [],
    };
}

function IIW34ClosingCeremony(): PlannableEvent {
    return {
        id: createIdString(),
        name: 'IIW34 Closing Ceremony',
        description: 'Closing ceremony',
        beginning: new Date(Date.parse('2022-04-28T22:00:00.000Z')),
        end: new Date(Date.parse('2022-04-28T23:00:00.000Z')),
        location: ComputerHistoryMuseumLocation(),
        organizers: IIWOrganizers(),
        subEvents: [],
    };
}

function IIW34(): PlannableEvent {
    return {
        id: createIdString(),
        name: 'Internet Identity Workshop XXXIV (#34) 2022A',
        description: 'The Internet Identity Workshop #IIW has been finding, probing and solving identity issues twice every year since 2005.',
        registration: {
            url: 'https://www.eventbrite.com/e/internet-identity-workshop-iiwxxxiv-34-2022a-tickets-220922293527',
        },
        beginning: new Date(Date.parse('2022-04-26T15:00:00.000Z')),
        end: new Date(Date.parse('2022-04-28T23:00:00.000Z')),
        location: ComputerHistoryMuseumLocation(),
        organizers: IIWOrganizers(),
        subEvents: [
            IIW34Keynote(),
            IIW34ClosingCeremony(),
        ],
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

export const DefaultProps: ComponentStory<typeof EventPlanner> = (
  args
) => {
  return <EventPlanner {...args} />;
};

type MutableEventState = {
    event: PlannableEvent
}

function MutableEventStateInit(createInitialEvent: () => PlannableEvent): MutableEventState {
    return {
        event: createInitialEvent(),
    };
}

enum MutableEventActionType {
    addEvent = 'addEvent',
}

type Action =
{ type: MutableEventActionType.addEvent }
;

export const Mutable: ComponentStory<typeof EventPlanner> = (
    args
  ) => {
      const [state, dispatch] = React.useReducer(
          (state: MutableEventState, action: Action): MutableEventState => {
              console.log('Mutable reducing', { state, action });
              switch (action.type) {
                  case MutableEventActionType.addEvent:
                      // eslint-disable-next-line no-case-declarations
                      const newEvent = IIW34ClosingCeremony();
                      return {
                          ...state,
                          event: {
                              ...state.event,
                              subEvents: [
                                  ...state.event.subEvents,
                                  newEvent,
                              ],
                          },
                      };
                    //   state.event.subEvents.push(newEvent);
                      break;
                    default:
                        // eslint-disable-next-line no-case-declarations
                        const x: never = action.type;
              }
              return state;
          },
          IIW34,
          MutableEventStateInit,
      );
    const addEvent = React.useCallback(
        () => {
            dispatch({
                type: MutableEventActionType.addEvent,
            });
        },
        [dispatch]
    );
    return <EventPlanner event={state.event} addEvent={addEvent} />;
  };

export const Collaboration: ComponentStory<typeof EventPlanner> = (
    args
  ) => {
    const numPeers = 2;
    const peers = React.useMemo(() => {
        return new Array(numPeers).fill(0).map((e,i) => ({
            name: i,
            event: IIW34(),
        }));
    }, [numPeers]);
    return <>
        <div style={{display: 'flex'}}>
            {peers.map((peer) => {
                return <div key={peer.name} style={{flexGrow: 1}}>
                    <EventPlanner
                        event={peer.event}
                    />
                </div>;
            })}
        </div>
    </>;
  };
  