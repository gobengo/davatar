import * as React from "react";
import { EventHomePage } from "./EventHomePage";
import type { PlannableEvent } from "./types";

export type { PlannableEvent } from "./types";

// eslint-disable-next-line @typescript-eslint/ban-types
export const EventPlanner = function ({ event }: { event: PlannableEvent }) {
  return <>
      <EventHomePage event={event} />
    </>;
};
