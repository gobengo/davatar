import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type { AddressLocation, PlannableEvent  } from "davatar-ui";
import { EventPlanner  } from "davatar-ui";

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
