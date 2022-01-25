import * as React from "react";
import type { EventAdder } from "./EventPlanner";
import type { PlannableEvent } from "./types";

// eslint-disable-next-line @typescript-eslint/ban-types
export const EventHomePage = function ({
  event,
  addEvent,
}: {
  event: PlannableEvent;
  addEvent?: EventAdder;
}) {
  return (
    <>
      <header>
        <h1>{event.name}</h1>
        {event.organizers.length && (
          <>
            <p>by {event.organizers.map((o) => o.name).join(", ")}</p>
          </>
        )}
      </header>
      <p>{event.description}</p>
      <>
        <h2>Date and time</h2>
        <div className="event-details__data">
          <time data-automation="event-details-time">
            <span className="js-date-time-first-line">
              {event.beginning.toLocaleString()} –
            </span>
            <br />
            <span className="js-date-time-second-line">
              {event.end.toLocaleString()}
            </span>
          </time>
        </div>
      </>
      <>
        <h2>Location</h2>
        <div className="event-details__data">
          <p>
            {event.location.name}
            <br />
            {event.location.address}
            <br />
            {event.location.city}, {event.location.zip}
          </p>
        </div>
      </>

      {event.subEvents.length && (
        <>
          <header>
            <h2>Events</h2>
            {addEvent && <>
              <button onClick={addEvent}>+</button>
            </>}
          </header>
          <ul>
            {event.subEvents.map((subEvent) => (
              <li key={subEvent.id}>
                <EventTimelineItem event={subEvent}></EventTimelineItem>
              </li>
            ))}
          </ul>
        </>
      )}
      <></>
    </>
  );
};

function EventTimelineItem({ event }: { event: PlannableEvent }) {
  const formattedBeginning = React.useMemo(() => {
    return formatEventTime(event.beginning);
  }, [event]);
  const formattedEnd = React.useMemo(() => {
    return formatEventTime(event.end);
  }, [event]);
  return (
    <>
      <p>
        {formattedBeginning} - {formattedEnd}
      </p>
      <header>
        <strong>{event.name}</strong>
      </header>
    </>
  );
}

function formatEventTime(time: Date) {
  return new Intl.DateTimeFormat("en-US", {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    timeStyle: "short",
    // dayPeriod: "long",
    // hour: "numeric",
    // hourCycle: "h12",
    // dayPeriod: "short",
    // timeZone: "UTC",
  }).format(time);
}
