export type JSONDatetime = {
    iso8601: string;
}
export interface PlannableEvent {
    id: string;
    name: string;
    description: string;
    registration?: {
        url: string;
    },
    beginning: JSONDatetime,
    end: JSONDatetime,
    location: AddressLocation,
    organizers: Array<{ name: string }>,
    subEvents: PlannableEvent[],
}

/**
 * Info required to print an address of an event
 */
export interface AddressLocation {
    name: string
    address: string
    city: string
    zip: string
}
