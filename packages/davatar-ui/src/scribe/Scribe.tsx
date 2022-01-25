import * as React from "react";
import * as Y from "yjs";
import { RichTextEditor } from "../RichTextEditor";
import type { WebsocketProvider } from "y-websocket";
import { WebrtcProvider  } from "y-webrtc";

const rtcProviderRoomNameToYjsDoc = new Map<string, Y.Doc>();

function createCollaborationProvider(yDoc: Y.Doc, roomName: string) {
    console.log('Scribe creating WebrtcProvider');
    const provider = new WebrtcProvider(
      roomName,
      yDoc
    );
    return provider;
  }

export const Scribe = (props: {
    room?: string
}) => {
    console.log('scribe room', props.room);
    const { room } = props;
    const yDoc = React.useMemo(
        () => {
            if (props.room === undefined) {
                return;
            }
            const room = props.room;
            if ( ! rtcProviderRoomNameToYjsDoc.has(room)) {
                console.log('creating new Y.Doc for room', room);
                rtcProviderRoomNameToYjsDoc.set(room, new Y.Doc);
            } else {
                console.log('reusing existing Y.Doc for room', room);
            }
            return rtcProviderRoomNameToYjsDoc.get(room);
        },
        [props.room],
    );
    const collaborationProvider = React.useMemo(
        () => {
            if (yDoc && room) {
                return createCollaborationProvider(yDoc, room);
            }
        },
        [yDoc],
    );
    return <>
        <h1>Scribe</h1>
        {props.room && <p>room: {props.room}</p>}
        <RichTextEditor yDoc={yDoc} awareness={collaborationProvider?.awareness} />
    </>;
};

export default Scribe;
