import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { ProsemirrorEditor, ProsemirrorYjsEditor } from "davatar-ui";
import { EditorState } from "prosemirror-state";
import { schema } from "prosemirror-schema-basic";
import type { Schema } from 'prosemirror-model';
import { prosemirrorToYDoc } from 'y-prosemirror';
import { DOMParser } from "prosemirror-model";
import * as Y from 'yjs';
import { WebrtcProvider } from "y-webrtc";

const defaultProps: Parameters<typeof ProsemirrorEditor>[0] = {
  state: EditorState.create({ schema }),
  dispatchTransaction(tr) {
    /* noop */
  },
};

export default {
  title: "ProsemirrorEditor",
  component: ProsemirrorEditor,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof ProsemirrorEditor>;

const defaultPropsProsemirrorYjsEditor: Parameters<typeof ProsemirrorYjsEditor>[0] = {
  yjsDoc: new Y.Doc,
};

export const DefaultProps: ComponentStory<typeof ProsemirrorEditor> = (
  args
) => {
  return <ProsemirrorEditor {...args} />;
};

function htmlToProsemirrorNode(html: string, schema: Schema, document=globalThis.document) {
  const el = document.createElement('div');
  el.innerHTML = html;
  return DOMParser.fromSchema(schema).parse(el);
}

const SampleEditorStateChoices: () => EditorState[] = () => (new Array(10))
.fill(0)
.map((e,i) => i)
.map(c => `<p>choice ${c}</p>`)
.map(html => EditorState.create({
  doc: htmlToProsemirrorNode(html, schema),
}))
;

export const StateSwitcher: ComponentStory<typeof ProsemirrorEditor> = (
  args
) => {
  const [stateChoices] = React.useState(SampleEditorStateChoices);
  const [choiceIndex, setChoiceIndex] = React.useState(0);
  const chosenState = React.useMemo(
    () => stateChoices[choiceIndex],
    [stateChoices, choiceIndex],
  );
  const [choiceIndexToUpdatedState] = React.useState<Record<string, unknown>>({});
  return <>
    <h1>ProsemirrorEditor w/ switchable EditorState choices</h1>
    <ul>
    {stateChoices.map(
      (state, index) => <li key={index}>
        <span onClick={() => setChoiceIndex(index)}>
          EditorState Choice {index}
        </span>
      </li>
    )}
    </ul>
    <h2>Chosen State</h2>
    <p>
    {JSON.stringify(chosenState)}
    </p>
    <ProsemirrorEditor
      state={chosenState}
      dispatchTransaction={() => {/* noop */}}
    ></ProsemirrorEditor>
  </>;
  return <ProsemirrorEditor {...args} />;
};

const SampleYjsDocChoices = () => (new Array(10))
.fill(0)
.map((e,i) => i)
.map(c => `<p>choice ${c}</p>`)
.map(html => prosemirrorToYDoc(htmlToProsemirrorNode(html, schema)))
;

export const YjsDocStateSwitcher: ComponentStory<typeof ProsemirrorEditor> = (
  args
) => {
  const [stateChoices] = React.useState(SampleYjsDocChoices);
  const [choiceIndex, setChoiceIndex] = React.useState(0);
  const chosenYjsDoc = React.useMemo(
    () => stateChoices[choiceIndex],
    [stateChoices, choiceIndex],
  );
  return <>
    <h1>ProsemirrorEditor w/ switchable EditorState choices</h1>
    <ul>
    {stateChoices.map(
      (state, index) => <li key={index}>
        <span onClick={() => setChoiceIndex(index)}>
          YjsDoc Choice {index}
        </span>
      </li>
    )}
    </ul>
    <h2>Chosen State</h2>
    <p>
      {JSON.stringify(chosenYjsDoc)}
    </p>
    <ProsemirrorYjsEditor yjsDoc={chosenYjsDoc}></ProsemirrorYjsEditor>
  </>;
};

export const MultiRoomCollaboration: ComponentStory<typeof ProsemirrorEditor> = (
  args
) => {
  const [choices] = React.useState(SampleYjsDocChoices);
  const [choiceIndex, setChoiceIndex] = React.useState(0);
  const choice = React.useMemo(
    () => choices[choiceIndex],
    [choices, choiceIndex],
  );
  React.useEffect(
    () => {
      const roomName = 'FHsTyFHNmvNpw4o7+rp+M1yqMyBF8vXSBRkZtkQ0RKY';
      const collaborationProvider = new WebrtcProvider(roomName, choice, );
      return () => {
        collaborationProvider.destroy();
      };
    },
    [choice],
  );
  return <>
    <h1>ProsemirrorEditor w/ switchable EditorState choices</h1>
    <ul>
    {choices.map(
      (option, index) => <li key={index}>
        <span onClick={() => setChoiceIndex(index)}>
          Document {index}
        </span>
      </li>
    )}
    </ul>
    <h2>Collaboratively Edit Choice {choiceIndex}</h2>
    <p>
      {JSON.stringify(choice)}
    </p>
    <ProsemirrorYjsEditor yjsDoc={choice}></ProsemirrorYjsEditor>
  </>;
};
