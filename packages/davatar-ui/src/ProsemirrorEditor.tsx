import { EditorState } from "prosemirror-state";
import * as React from "react";
import { DOMParser, DOMSerializer} from "prosemirror-model";
import * as pmExampleSetup from "prosemirror-example-setup";
// import 'prosemirror-view/style/prosemirror.css';
import * as Y from 'yjs';
import { EditorView } from 'prosemirror-view';
import type { Node as ProsemirrorNode ,Schema} from "prosemirror-model";
import type { Plugin } from 'prosemirror-state';

export const ProsemirrorEditor = function (props: {
    state: EditorState
}) {
    const view = React.useMemo(
        () => {
            const view = new EditorView(undefined, {
                state: props.state,
                dispatchTransaction(tr) {
                    console.log('CustomEditorProvider dispatchTransaction', tr);
                    // const newState = editorState.apply(tr);
                    // setEditorState(newState);
                    // pmDocView.updateState(newState);
                    // setEditorState(newState);
                },
            });
            return view;
        },
        [props.state]
    );
    const editorRef = React.useCallback(
        (element: HTMLDivElement | null) => {
        if (element && view) {
            // first clear all other children
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
            element.appendChild(view.dom);
        }
        },
        [view]
    );
    return <>
        <h1>Prosemirror Editor</h1>
        return <div ref={editorRef} className="prosemirror-editor" />;
    </>;
};

const CustomEditorStateContext = React.createContext<EditorState | null>(null);
const CustomEditorViewContext = React.createContext<EditorView | null>(null);

export function CustomEditorProvider<A extends string,B extends string>(props: {
    doc: ProsemirrorNode<Schema<A,B>>
    schema: Schema<A,B>
    plugins: Plugin[]
    children: JSX.Element
}) {
    const [editorState, setEditorState] = React.useState<EditorState<Schema<A,B>>>(EditorState.create(props));
    const [docToView] = React.useState(new WeakMap<ProsemirrorNode<Schema<A,B>>, EditorView<Schema<A,B>>>());
    const view = React.useMemo(
        () => {
            console.log('CustomEditorProvider creating view for doc', { doc: editorState.doc });
            const existingView = docToView.get(editorState.doc);
            if (existingView) {
                console.log('CustomEditorProvider using existingView', existingView);
                return existingView;
            }
            const pmDocView = new EditorView(undefined, {
                state: editorState,
                dispatchTransaction(tr) {
                    console.log('CustomEditorProvider dispatchTransaction', tr);
                    const newState = editorState.apply(tr);
                    // setEditorState(newState);
                    // pmDocView.updateState(newState);
                    // setEditorState(newState);
                },
            });
            docToView.set(editorState.doc, pmDocView);
            console.log('CustomEditorProvider created new EditorView', { doc: editorState.doc, pmDocView });
            return pmDocView;
        },
        [editorState.doc]
    );
    return (
        <CustomEditorStateContext.Provider value={editorState}>
          <CustomEditorViewContext.Provider value={view}>
            {props.children}
          </CustomEditorViewContext.Provider>
        </CustomEditorStateContext.Provider>
    );
}

export const CustomEditor = function<A extends string,B extends string>(props: {
    autoFocus?: boolean;
}) {
    const { autoFocus = false } = props;
    const view = React.useContext(CustomEditorViewContext);

    const editorRef = React.useCallback(
        (element: HTMLDivElement | null) => {
        if (element && view) {
            element.appendChild(view.dom);
        }
        },
        [view]
    );

    React.useEffect(() => {
        if (autoFocus && view) {
            view.focus();
        }
    }, [autoFocus, view]);

    return <div ref={editorRef} className="prosemirror-editor" />;
};
