import * as React from "react";
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

export const WithDefaultProps: ComponentStory<typeof Scribe> = (
  args
) => <Scribe {...args} />;

export const MultipleEditors: ComponentStory<typeof Scribe> = (
  args
) => {
  return (
    <>
      <dl>
        <dt>Editor 1</dt>
        <dd>
          <Scribe
            {...args}
          />
        </dd>
        <dt>Editor 2</dt>
        <dd>
          <Scribe
            {...args}
          />
        </dd>
      </dl>
    </>
  );
};
