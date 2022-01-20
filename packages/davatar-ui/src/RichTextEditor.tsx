import * as React from "react";
import {Schema, DOMParser, DOMSerializer} from "prosemirror-model";
import * as pmExampleSetup from "prosemirror-example-setup";
// import 'prosemirror-view/style/prosemirror.css';
import type * as Y from 'yjs';

export type RichText = string;

export const RichTextEditor = function (
    props: {
        yDoc: Y.Doc
        type: Y.XmlFragment
        awareness: Awareness
    }
) {
    return <>
        <p>
            I am RichTextEditor.
        </p>
        <ProseMirrorEditor {...props} />
    </>;
};

import {schema} from './ySchema';
import {useProseMirror, ProseMirror} from 'use-prosemirror';
import type { EditorState } from "prosemirror-state";
import { yCursorPlugin, ySyncPlugin, yUndoPlugin, undo, redo } from "y-prosemirror";
import type { Awareness } from "y-protocols/awareness";
import { keymap } from 'prosemirror-keymap';

function ProseMirrorEditor(
    props: {
        yDoc: Y.Doc
        awareness: Awareness
        type: Y.XmlFragment
    }
) {
    const [state, setState] = useProseMirror({
        schema,
        plugins: [
            ySyncPlugin(props.type),
            yCursorPlugin(props.awareness),
            yUndoPlugin(),
            keymap({
              'Mod-z': undo,
              'Mod-y': redo,
              'Mod-Shift-z': redo,
            }),
          ].concat(pmExampleSetup.exampleSetup({ schema, menuBar: false })),
    });
    function onProseMirrorChange(s: EditorState) {
        console.log('onProseMirrorChange', s);
        setState(s);
    }
    return <>
        <div style={{whiteSpace: 'pre-wrap'}}>
            <ProseMirror state={state} onChange={setState} />
        </div>
    </>;
};
