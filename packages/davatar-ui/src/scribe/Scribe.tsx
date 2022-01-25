import * as React from "react";
import * as Y from "yjs";
import { RichTextEditor } from "../RichTextEditor";
import { WebrtcProvider  } from "y-webrtc";
import styled from 'styled-components';

enum DocumentMenuOptions {
    shareDocument = 'shareDocument',
    loadSharedDocument = 'loadSharedDocument',
}

const rtcProviderRoomNameToYjs = new Map<string, {
    yDoc: Y.Doc
    provider?: WebrtcProvider
}>();

function createCollaborationProvider(yDoc: Y.Doc, roomName: string) {
    console.log('Scribe creating WebrtcProvider');
    const provider = new WebrtcProvider(
      roomName,
      yDoc
    );
    return provider;
  }

const ScribeDocumentMenuSelect = styled('select')`
-webkit-appearance: none;
-moz-appearance: none;
appearance: none;
border: 0;
background-color: transparent;

cursor: pointer;
`;

function createRandomRoom() {
    return Math.random().toString().slice(2);
}

interface LoadDocumentFormElements extends HTMLFormControlsCollection {
    document: HTMLInputElement
  }

interface LoadDocumentsFormElement extends HTMLFormElement {
    readonly elements: LoadDocumentFormElements
  }

export const Scribe = (props: {
    initialRoom?: string
}) => {
    const [room, setRoom] = React.useState(props.initialRoom || createRandomRoom());
    const [showShare, setShowShare] = React.useState(false);
    const [showLoadShared, setShowLoadShared] = React.useState(false);
    const yDoc: Y.Doc = React.useMemo(
        () => {
            const yjsRoom = rtcProviderRoomNameToYjs.get(room);
            if ( ! yjsRoom) {
                console.log('creating new Y.Doc for room', room);
                const yDoc = new Y.Doc();
                rtcProviderRoomNameToYjs.set(room, {
                    yDoc,
                });
            } else {
                console.log('Scribe reusing existing yjsRoom', { yjsRoom, room });
            }
            const yDoc = rtcProviderRoomNameToYjs.get(room)?.yDoc;
            if ( ! yDoc) {
                throw new Error('error getting yDoc');
            }
            return yDoc;
        },
        [room, rtcProviderRoomNameToYjs],
    );
    const collaborationProvider = React.useMemo(
        () => {
            const roomYjs = rtcProviderRoomNameToYjs.get(room);
            console.log('rtcProviderRoomNameToYjs roomYjs', roomYjs);
            if (roomYjs?.provider) {
                if (roomYjs.provider.roomName !== room) {
                    console.log('destroying old provider for room', roomYjs);
                    roomYjs.provider.destroy();
                    roomYjs.provider = undefined;
                    rtcProviderRoomNameToYjs.set(room, roomYjs);
                }
            }
            if (roomYjs && ! roomYjs.provider) {
                console.log('creating collaborationProvider', { yDoc, room });
                const provider = createCollaborationProvider(yDoc, room);
                rtcProviderRoomNameToYjs.set(room, {
                    yDoc,
                    provider,
                });
            }
            return rtcProviderRoomNameToYjs.get(room)?.provider;
        },
        [rtcProviderRoomNameToYjs, yDoc, room],
    );
    const onChangeDocumentMenu = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        switch (value as unknown) {
            case DocumentMenuOptions.shareDocument:
                setShowShare(true);
                break;
            case DocumentMenuOptions.loadSharedDocument:
                setShowLoadShared(true);
                break;
            default:
                console.error('event.target.value', value);
                throw new Error('unexpected event.target.value');
        }
        console.log('onChangeDocumentMenu', value);
    }, [setShowShare, setShowLoadShared]);
    const onSubmitLoadDocument = React.useCallback((event: React.FormEvent<LoadDocumentsFormElement>) => {
        event.preventDefault();
        const documentToLoad = event.currentTarget?.elements?.document?.value;
        console.log('onSubmitLoadDocument', documentToLoad);
        if (documentToLoad) {
            setRoom(documentToLoad);
        }
    }, [setRoom]);
    return <>
        {room && <p>room: {room}</p>}
        <RichTextEditor yDoc={yDoc} awareness={collaborationProvider?.awareness} />
        <ScribeDocumentMenuSelect value="default" onChange={onChangeDocumentMenu}>
            <option value="default">&hellip;</option>
            <option value={DocumentMenuOptions.shareDocument}>Share Document</option>
            <option value={DocumentMenuOptions.loadSharedDocument}>Load Shared Document</option>
        </ScribeDocumentMenuSelect>
        {
            showShare && <>
                <header><strong>Share Document</strong></header>
                <label>Document</label><input type="text" readOnly value={room}></input>
            </>
        }
        {
            showLoadShared && <>
                <header><strong>Load Shared Document</strong></header>
                <form onSubmit={onSubmitLoadDocument}>
                    <label>Document to Load</label>
                    <input type="text" name="document" />
                    <input type="submit" value="Load"></input>
                </form>
            </>
        }
        {
            true && <>
                <p>collaborationProvider: {collaborationProvider?.roomName}</p>
            </>
        }
    </>;
};

export default Scribe;
