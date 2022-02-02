import * as React from "react";
import { DOMParser, DOMSerializer} from "prosemirror-model";
import * as pmExampleSetup from "prosemirror-example-setup";
// import 'prosemirror-view/style/prosemirror.css';
import * as Y from 'yjs';
import { EditorView } from 'prosemirror-view';
import type { Node as ProsemirrorNode ,Schema} from "prosemirror-model";
import { EditorState} from 'prosemirror-state';
import type { Plugin } from 'prosemirror-state';
import {schema} from './ySchema';
import { yCursorPlugin, ySyncPlugin, yUndoPlugin, undo, redo, yDocToProsemirror } from "y-prosemirror";
import type { Awareness } from "y-protocols/awareness";
import { keymap } from 'prosemirror-keymap';
import { CustomEditor, CustomEditorProvider } from "./ProsemirrorEditor";

export type RichText = string;

export const RichTextEditor = function (
    props: {
        yDoc?: Y.Doc
        awareness?: Awareness
    }
) {
    const yDoc = React.useMemo(() => props.yDoc || new Y.Doc, [props.yDoc]);
    return <>
        <ProseMirrorEditor {...{
            ...props,
            yDoc,
        }} />
    </>;
};

function ProseMirrorEditor(
    props: {
        yDoc: Y.Doc
        awareness?: Awareness
    }
) {
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState(undefined), []);
    const [yjsDocVersion, setYjsDocVersion] = React.useState(0);
    const yDoc = props.yDoc;
    React.useEffect(
        () => {
            console.log('new yDoc in ProseMirrorEditor', {
                pm: yDocToProsemirror(schema, yDoc),
            });
            setYjsDocVersion(v => v + 1);
        },
        [yDoc]
    );
    const yProviderAwareness: Awareness|undefined = props.awareness;
    const yType = React.useMemo(() => {
        return yDoc.getXmlFragment('prosemirror');
    }, [yDoc]);
    const pm2Plugins = React.useMemo(
        () => {
            return [
                ...(yType ? [ySyncPlugin(yType)] : []),
                ...(yProviderAwareness ? [yCursorPlugin(yProviderAwareness)] : []),
                yUndoPlugin(),
                keymap({
                  'Mod-z': undo,
                  'Mod-y': redo,
                  'Mod-Shift-z': redo,
                }),
              ];
        },
        [yType, yProviderAwareness]
    );
    const [yDocToPmDoc] = React.useState(new Map<Y.Doc, ProsemirrorNode<Schema>>());
    const pmDoc = React.useMemo(
        () => {
            console.log('ProseMirrorEditor yDoc changed', yDoc, yDocToPmDoc.get(yDoc));
            const pmDoc = yDocToProsemirror(schema, yDoc);
            yDocToPmDoc.set(yDoc, pmDoc);
            return pmDoc;
        },
        [yDoc, yDocToPmDoc]
    );
    return <>
        <div style={{whiteSpace: 'pre-wrap'}}>
            <p>
                version: {yjsDocVersion}
            </p>
            <p>
                guid: {yDoc.guid}
            </p>
            <CustomEditorProvider doc={pmDoc} schema={schema} plugins={pm2Plugins}>
                <CustomEditor />
            </CustomEditorProvider>
        </div>
    </>;
};
