import * as React from "react";
import { EventHomePage } from "./EventHomePage";
import type { PlannableEvent } from "./types";
import type * as Y from "yjs";

export type { PlannableEvent } from "./types";
export type EventAdder = () => void;

// eslint-disable-next-line @typescript-eslint/ban-types
export const EventPlanner = function (props: {
  event: PlannableEvent;
  addEvent?: EventAdder;
  yjsDocs?: {
    name?: Y.Text,
    description?: Y.Text,
  }
}) {
  return (
    <>
      <EventHomePage
        {...props}
        />
    </>
  );
};
