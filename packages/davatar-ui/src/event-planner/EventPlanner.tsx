import * as React from "react";
import { EventHomePage } from "./EventHomePage";
import type { PlannableEvent } from "./types";

export type { PlannableEvent } from "./types";
export type EventAdder = () => void;

// eslint-disable-next-line @typescript-eslint/ban-types
export const EventPlanner = function ({
  event,
  addEvent,
}: {
  event: PlannableEvent;
  addEvent?: EventAdder;
}) {
  return (
    <>
      <EventHomePage event={event} addEvent={addEvent} />
    </>
  );
};
