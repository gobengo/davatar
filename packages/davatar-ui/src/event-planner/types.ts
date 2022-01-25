export interface PlannableEvent {
    name: string;
    description: string;
    registration?: {
        url: string;
    },
    beginning: Date,
    end: Date,
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
