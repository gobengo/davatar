import * as React from "react";
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import 'quill/dist/quill.snow.css';
import styled from "styled-components";

Quill.register('modules/cursors', QuillCursors);

const QuillContainer = styled('div')`
height: inherit;
`;

export function QuillEditor(props: {
    placeholder: string,
    toolbar: boolean,
    onQuill?: (quill: Quill) => void,
}) {
    const editorElRef = React.useRef<HTMLDivElement>(null);
    const [quill, setQuill] = React.useState<null|Quill>(null);
    React.useEffect(
        () => {
            if ( ! editorElRef.current) {
                return;
            }
            const quill = new Quill(editorElRef.current, {
                modules: {
                    cursors: true,
                    history: {
                        userOnly: true,
                    },
                    toolbar: props.toolbar || false,
                },
                theme: 'snow',
                placeholder: props.placeholder,
            });
            // quill.setText('');
            setQuill(quill);
        },
        [editorElRef.current]
    );
    React.useEffect(
        () => {
            if (props.onQuill && quill) {
                props.onQuill(quill);
            }
        },
        [quill],
    );
    return <>
        <QuillContainer ref={editorElRef}></QuillContainer>
    </>;
}
