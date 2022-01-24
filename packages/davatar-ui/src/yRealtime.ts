export {};
// import { keymap } from 'prosemirror-keymap';
// import { Extension } from '@tiptap/core';
// import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
// import { WebsocketProvider } from 'y-websocket';
// import type * as Y from 'yjs';
// import type * as awarenessProtocol from "y-protocols/awareness";

// // const ydoc = new Y.Doc();
// // const provider = new WebsocketProvider('wss://demos.yjs.dev', 'tiptap-demo', ydoc);
// // const type = ydoc.getXmlFragment('prosemirror');

// export default class RealtimeExtension extends Extension {
//   constructor(
//       protected yDoc: Y.Doc,
//       protected awareness: awarenessProtocol.Awareness
//   ) {
//       super();
//   }
//   name = 'realtime';

//   get plugins () {
//     return [
//       ySyncPlugin(this.yDoc.getXmlFragment('prosemirror')),
//       yCursorPlugin(this.awareness),
//       yUndoPlugin(),
//       keymap({
//         'Mod-z': undo,
//         'Mod-y': redo,
//         'Mod-Shift-z': redo,
//       }),
//     ];
//   }
// }