import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

import { RichTextEditor } from 'davatar-ui';

export default {
  title: 'Davatar/RichTextEditor',
  component: RichTextEditor,
} as ComponentMeta<typeof RichTextEditor>;

export const Template: ComponentStory<typeof RichTextEditor> = (args) => <RichTextEditor {...args} />;
