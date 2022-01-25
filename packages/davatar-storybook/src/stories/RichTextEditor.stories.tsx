import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { WebsocketProvider } from "y-websocket";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { prosemirrorToYDoc } from "y-prosemirror";
import { DOMParser } from "prosemirror-model";

const yDoc = new Y.Doc();
const pmXmlFragment = yDoc.getXmlFragment("prosemirror");
console.log(
  "creating provider davatar-storybook-RichTextEditor-stories-default-webrtc"
);
// const rtcProvider = new WebrtcProvider(
//   "davatar-storybook-RichTextEditor-stories-default-webrtc",
//   yDoc
// );
import { RichTextEditor } from "davatar-ui";
import { schema } from "davatar-ui/src/ySchema";

// const explicitYjsProps: Parameters<typeof RichTextEditor>[0] = {
//   awareness: rtcProvider.awareness,
//   yDoc,
// };

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
    "wss://demos.yjs.dev",
    "davatar-storybook-RichTextEditor-stories-default",
    yDoc
  );
  return wsProvider;
}

export const MultipleEditors: ComponentStory<typeof RichTextEditor> = (
  args
) => {
  const [yDoc, setYDoc] = React.useState<Y.Doc>(new Y.Doc());
  const [collabProvider, setCollabProvider] = React.useState(
    createCollabProvider(yDoc)
  );
  React.useEffect(() => {
    const provider = createCollabProvider(yDoc);
    setCollabProvider(provider);
    return () => {
      provider.destroy();
    };
  }, [yDoc]);
  const yType = React.useMemo(() => {
    return yDoc.getXmlFragment("prosemirror");
  }, [yDoc]);
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

// export const ExplicitYjsProps: ComponentStory<typeof RichTextEditor> = (
//   args
// ) => <RichTextEditor {...explicitYjsProps} {...args} />;

export const DefaultProps: ComponentStory<typeof RichTextEditor> = (args) => (
  <RichTextEditor {...args} />
);

export const SwitchableYjsDocument: ComponentStory<typeof RichTextEditor> = (
  args
) => {
  const [emptyDoc] = React.useState(() => new Y.Doc);
  const [yd1] = React.useState((() => {
    const html = '<strong>yDoc1</strong>';
    const el = document.createElement('div');
    el.innerHTML = html;
    return prosemirrorToYDoc(DOMParser.fromSchema(schema).parse(el));
  })());
  const [yd2] = React.useState((() => {
    const html = '<em>yDoc2</em>';
    const el = document.createElement('div');
    el.innerHTML = html;
    return prosemirrorToYDoc(DOMParser.fromSchema(schema).parse(el));
  })());
  const [yDocChoice, setYDocChoice] = React.useState(yd1);
  function makeChoiceOnClick(doc: Y.Doc) {
    return function (e: React.MouseEvent<HTMLElement>) {
      console.log('switchable choosing ydoc', doc);
      setYDocChoice(doc);
    };
  }
  return (
    <>
      <ul>
        <li onClick={makeChoiceOnClick(emptyDoc)}>Use empty doc</li>
        <li onClick={makeChoiceOnClick((yd1))}>Use Doc 1</li>
        <li onClick={makeChoiceOnClick((yd2))}>Use Doc 2</li>
      </ul>
      <RichTextEditor yDoc={yDocChoice} />
    </>
  );
};
