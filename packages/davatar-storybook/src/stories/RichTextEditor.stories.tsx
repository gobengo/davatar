import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { WebsocketProvider } from "y-websocket";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { prosemirrorToYDoc } from "y-prosemirror";

const yDoc = new Y.Doc();
const pmXmlFragment = yDoc.getXmlFragment("prosemirror");
const wsProvider = new WebsocketProvider('wss://demos.yjs.dev', 'davatar-storybook-RichTextEditor-stories-default', yDoc);
const rtcProvider = new WebrtcProvider(
  "davatar-storybook-RichTextEditor-stories-default",
  yDoc
);
import { RichTextEditor } from "davatar-ui";

const explicitYjsProps: Parameters<typeof RichTextEditor>[0] = {
  awareness: rtcProvider.awareness,
  yDoc,
  yType: pmXmlFragment,
};

const defaultProps: Parameters<typeof RichTextEditor>[0] = {};

export default {
  title: "Davatar/RichTextEditor",
  component: RichTextEditor,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof RichTextEditor>;

function createCollabProvider(yDoc: Y.Doc) {
  const wsProvider = new WebsocketProvider(
    'wss://demos.yjs.dev',
    "davatar-storybook-RichTextEditor-stories-default",
    yDoc
  );
  return wsProvider;
}

export const MultipleEditors: ComponentStory<typeof RichTextEditor> = (
  args
) => {
  const [yDoc, setYDoc] = React.useState<Y.Doc>(new Y.Doc());
  const [collabProvider, setCollabProvider] = React.useState(createCollabProvider(yDoc));
  React.useEffect(
    () => {
      const provider = createCollabProvider(yDoc);
      setCollabProvider(provider);
      return () => {
        provider.destroy();
      };
    },
    [yDoc]
  );
  const yType = React.useMemo(
    () => {
      return yDoc.getXmlFragment('prosemirror');
    },
    [yDoc]
  );
  return (
    <>
      <dl>
        <dt>Editor 1 - Object A</dt>
        <dd>
          <RichTextEditor
            {...args}
            awareness={collabProvider.awareness}
            yDoc={yDoc}
            // yType={yType}
          />
        </dd>
        <dt>Editor 2 - Object A</dt>
        <dd>
          <RichTextEditor
            {...args}
            awareness={collabProvider.awareness}
            yDoc={yDoc}
            // yType={yType}
          />
        </dd>
        {/* <dt>Editor 3 - Object B</dt><dd>
  <RichTextEditor {...args} awareness={rtcProvider.awareness} />
  </dd> */}
      </dl>
    </>
  );
};

export const ExplicitYjsProps: ComponentStory<typeof RichTextEditor> = (
  args
) => <RichTextEditor {...explicitYjsProps} {...args} />;

export const DefaultProps: ComponentStory<typeof RichTextEditor> = (
  args
) => <RichTextEditor {...args} />;
