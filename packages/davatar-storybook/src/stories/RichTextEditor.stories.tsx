import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from "yjs";
import { prosemirrorToYDoc } from 'y-prosemirror';

const yDoc = new Y.Doc();
const pmXmlFragment = yDoc.getXmlFragment('prosemirror');
const provider = new WebsocketProvider('wss://demos.yjs.dev', 'bengo-foo', yDoc);
const rtcProvider = new WebrtcProvider('bengo-example-document', yDoc);
import { RichTextEditor } from 'davatar-ui';

const defaultProps: Parameters<typeof RichTextEditor>[0] = {
  awareness: provider.awareness,
  yDoc,
  type: pmXmlFragment,
};

export default {
  title: 'Davatar/RichTextEditor',
  component: RichTextEditor,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof RichTextEditor>;

export const Template: ComponentStory<typeof RichTextEditor> = (args) => <RichTextEditor {...args} />;
