import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { Scribe } from "davatar-ui";
import styled from 'styled-components';

const sampleRoom = 'davatar-storybook-scribe-room-0';

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

const MultipleEditorsContainer = styled('div')`
  display: flex;
`;

const MultipleEditorsItem = styled('div')`
  flex-grow: 1;
`;

export const MultipleEditorsSameRoom: ComponentStory<typeof Scribe> = (
  args
) => {
  return (
    <>
      <MultipleEditorsContainer>
        <MultipleEditorsItem>
          <h1>Scribe A</h1>
          <Scribe
              initialRoom={sampleRoom}
            />
        </MultipleEditorsItem>
        <MultipleEditorsItem>
          <h1>Scribe B</h1>
          <Scribe
              initialRoom={sampleRoom}
            />
        </MultipleEditorsItem>
      </MultipleEditorsContainer>
    </>
  );
};

export const Multiple: ComponentStory<typeof Scribe> = (
  args
) => {
  return (
    <>
      <MultipleEditorsContainer>
        <MultipleEditorsItem>
          <h1>Scribe A</h1>
          <Scribe
            initialRoom={sampleRoom} />
        </MultipleEditorsItem>
        <MultipleEditorsItem>
          <h1>Scribe B</h1>
          <Scribe />
        </MultipleEditorsItem>
      </MultipleEditorsContainer>
    </>
  );
};
