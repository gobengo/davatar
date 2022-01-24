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

export const MultipleEditors: ComponentStory<typeof Scribe> = (
  args
) => {
  return (
    <>
      <dl>
        <dt>Scribe 1</dt>
        <dd>
          <Scribe
            {...args}
          />
        </dd>
        <dt>Scribe 2</dt>
        <dd>
          <Scribe
            {...args}
          />
        </dd>
      </dl>
    </>
  );
};

export const SingleScribe: ComponentStory<typeof Scribe> = (
  args
) => <Scribe {...args} />;
