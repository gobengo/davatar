import * as React from "react";
import {Schema, DOMParser, DOMSerializer} from "prosemirror-model";
import * as pmExampleSetup from "prosemirror-example-setup";
// import 'prosemirror-view/style/prosemirror.css';

export type RichText = string;

export const RichTextEditor = function (
    props: {
        initialText: RichText
    }
) {
    return <>
        <p>
            I am RichTextEditor.
        </p>
        <ProseMirrorEditor {...props} />
    </>;
};

import {schema} from 'prosemirror-schema-basic';
import {useProseMirror, ProseMirror} from 'use-prosemirror';
import type { EditorState } from "prosemirror-state";

function ProseMirrorEditor(
    props: {
        initialText: RichText
    }
) {
    const parser = (content: string) => {
        const domNode = document.createElement("div");
        domNode.innerHTML = content;
        return DOMParser.fromSchema(schema).parse(domNode);
    };
    const [state, setState] = useProseMirror({
        schema,
        doc: parser(props.initialText),
        plugins: [
            ...pmExampleSetup.exampleSetup({ schema, menuBar: false }),
        ],
    });
    function onProseMirrorChange(s: EditorState) {
        console.log('onProseMirrorChange', s);
        setState(s);
    }
    return <ProseMirror state={state} onChange={setState} />;
};
