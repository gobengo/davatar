import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { Scribe } from "davatar-ui";

const defaultProps: Parameters<typeof Scribe>[0] = {};

export default {
  title: "Scribe",
  component: Scribe,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof Scribe>;

export const DefaultProps: ComponentStory<typeof Scribe> = (
  args
) => <Scribe {...args} />;

export const MultipleEditors: ComponentStory<typeof Scribe> = (
  args
) => {
  const [room, setRoom] = React.useState<string>("davatar-storybook-scribe-multipleeditors");
  return (
    <>
      <dl>
        <dt>Editor 1</dt>
        <dd>
          <Scribe
            room={room}
          />
        </dd>
        <dt>Editor 2</dt>
        <dd>
          <Scribe
            room={room}
          />
        </dd>
      </dl>
    </>
  );
};
