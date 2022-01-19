import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { RichTextEditor } from 'davatar-ui';

const defaultProps: Parameters<typeof RichTextEditor>[0] = {
  initialText: '(default text)',
};

export default {
  title: 'Davatar/RichTextEditor',
  component: RichTextEditor,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof RichTextEditor>;

export const Template: ComponentStory<typeof RichTextEditor> = (args) => <RichTextEditor {...args} />;
