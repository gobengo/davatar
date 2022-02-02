import { EditorState } from "prosemirror-state";
import * as React from "react";
import type * as Y from 'yjs';
import { schema } from './ySchema';
import { ProsemirrorEditor } from "./ProsemirrorEditor";
import type { Awareness } from "y-protocols/awareness";
import { yCursorPlugin, ySyncPlugin, yUndoPlugin, undo, redo, yDocToProsemirror } from "y-prosemirror";
import { keymap } from 'prosemirror-keymap';
import { exampleSetup } from 'prosemirror-example-setup';

export const ProsemirrorYjsEditor = function (props: {
    awareness?: Awareness
    yjsDoc: Y.Doc
}): JSX.Element {
    const { yjsDoc, awareness } = props;
    const prosemirrorNode = React.useMemo(
        () => yDocToProsemirror(schema, yjsDoc),
        [yjsDoc],
    );
    React.useEffect(
        () => {
            console.log('ProsemirrorYjsEditor yjsDoc changed', yjsDoc, prosemirrorNode);
        },
        [yjsDoc, prosemirrorNode],
    );
    const yProviderAwareness: Awareness|undefined = props.awareness;
    const yType = React.useMemo(() => {
        return yjsDoc.getXmlFragment('prosemirror');
    }, [yjsDoc]);
    const plugins = React.useMemo(
        () => {
            return [
                ySyncPlugin(yType),
                ...(yProviderAwareness ? [yCursorPlugin(yProviderAwareness)] : []),
                yUndoPlugin(),
                keymap({
                  'Mod-z': undo,
                  'Mod-y': redo,
                  'Mod-Shift-z': redo,
                }),
              ].concat();
        },
        [yType, yProviderAwareness]
    );
    const state = React.useMemo(
        () => {
            return EditorState.create({
                doc: prosemirrorNode,
                schema,
                plugins,
            });
        },
        [prosemirrorNode, plugins]
    );
    return <>
        <ProsemirrorEditor
            state={state}
            dispatchTransaction={(tr) => {
                // const newState = state.apply(tr);
                // setState(newState);
            }}
        ></ProsemirrorEditor>
    </>;
};
