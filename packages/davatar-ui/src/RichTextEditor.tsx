import * as React from "react";
import {Schema, DOMParser, DOMSerializer} from "prosemirror-model";
import * as pmExampleSetup from "prosemirror-example-setup";
// import 'prosemirror-view/style/prosemirror.css';
import * as Y from 'yjs';

export type RichText = string;

export const RichTextEditor = function (
    props: {
        yDoc?: Y.Doc
        yType?: Y.XmlFragment
        awareness?: Awareness
    }
) {
    return <>
        <ProseMirrorEditor {...props} />
    </>;
};

import {schema} from './ySchema';
import {useProseMirror, ProseMirror} from 'use-prosemirror';
import type { EditorState } from "prosemirror-state";
import { yCursorPlugin, ySyncPlugin, yUndoPlugin, undo, redo } from "y-prosemirror";
import type { Awareness } from "y-protocols/awareness";
import { keymap } from 'prosemirror-keymap';
import { WebrtcProvider } from 'y-webrtc';

function ProseMirrorEditor(
    props: {
        yDoc?: Y.Doc
        awareness?: Awareness
        yType?: Y.XmlFragment
    }
) {
    const yDocRef = React.useRef(props.yDoc || new Y.Doc());
    const yProviderAwareness: Awareness|undefined = React.useMemo<Awareness|undefined>(() => props.awareness || (() => {
        if (props.awareness) {
            return props.awareness;
        }
        return;
    })(), [props.awareness, yDocRef.current]);
    const [state, setState] = useProseMirror({
        schema,
        plugins: [
            ySyncPlugin(props.yType || yDocRef.current.getXmlFragment('prosemirror')),
            ...(yProviderAwareness ? [yCursorPlugin(yProviderAwareness)] : []),
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
            <ProseMirror state={state} onChange={onProseMirrorChange} />
        </div>
    </>;
};
