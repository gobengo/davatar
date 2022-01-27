import type * as Y from "yjs";
import * as React from "react";
import { QuillEditor } from "./QuillEditor";
import { QuillBinding } from 'y-quill';
import type Quill from "quill";
import type { Awareness } from "y-protocols/awareness";

export function YTextEditor(props: {
    text: Y.Text,
    awareness?: Awareness
}) {
    const [binding, setBinding] = React.useState<null|QuillBinding>(null);
    const [quill, setQuill] = React.useState<null|Quill>(null);
    React.useEffect(
        () => {
            if ( ! quill) {
                return;
            }
            const binding = new QuillBinding(
                props.text,
                quill,
                props.awareness,
            );
            setBinding(binding);
            return () => {
                binding.destroy();
                setBinding(null);
            };
        },
        [quill],
    );
    return <>
        <QuillEditor
            placeholder="..."
            toolbar={false}
            onQuill={setQuill}
            />
    </>;
}
