import * as React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type {
  IChatParticipant,
  IChatState,
  IChatActions,
  IChatMessage,
  IChatMessageContent,
  INameChange,
} from "davatar-ui";
import { Chat } from "davatar-ui";
import { createEphemeralId, useChatState } from "./chat";
import { FlexColumns } from "./ui";
import Libp2p from "libp2p";
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE } from "libp2p-noise";
// import * as MPLEX from "libp2p-mplex";

console.log('Libp2p', Libp2p);

export default {
  title: "chat/p2p Chat",
};

function useP2pChatState(): [IChatState, IChatActions] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [p2p, setP2p] = React.useState<null | any>(null);
  React.useEffect(() => {
    let p2p: Libp2p;
    (async () => {
      p2p = await Libp2p.create({
        modules: {
          transport: [WebRTCStar],
          streamMuxer: [],
          connEncryption: [NOISE],
        },
        addresses: {
          // add a listen address (localhost) to accept TCP connections on a random port
          listen: [
            // "/ip4/127.0.0.1/tcp/0",
            '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
            '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          ],
        },
      });

      await p2p.start();

      console.log("libp2p has started");
      // print out listening addresses
      console.log("listening on addresses:");
      p2p.multiaddrs.forEach((addr) => {
        console.log(`${addr.toString()}/p2p/${p2p.peerId.toB58String()}`);
      });
      // Listen for new peers
      p2p.on("peer:discovery", (peerId) => {
        console.log(`Found peer ${peerId.toB58String()}`);
      });

      // Listen for new connections to peers
      p2p.connectionManager.on("peer:connect", (connection) => {
        console.log(`Connected to ${connection.remotePeer.toB58String()}`);
      });

      // Listen for peers disconnecting
      p2p.connectionManager.on("peer:disconnect", (connection) => {
        console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
      });
      setP2p(p2p);
    })();
    return () => {
      p2p?.stop();
    };
  }, []);
  const [state, actions0] = useChatState();
  const actions = {
    ...actions0,
    onMessageContent(content: IChatMessageContent) {
      console.log("useP2pChatState onMessageContent", content);
    },
  };
  return [state, actions];
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const NChats = (props: {}) => {
  const [chatCount, setChatCount] = React.useState(2);
  const chatCountInputRef = React.useRef<HTMLInputElement | null>(null);
  const onChangeChatCount = React.useCallback(() => {
    const value = chatCountInputRef.current?.value;
    if (typeof value === "undefined") return;
    const valueParsed = parseInt(value, 10);
    if (isNaN(valueParsed)) return;
    setChatCount(valueParsed);
  }, []);
  const [chatState, actions] = useP2pChatState();
  const SingleChat = (props: { index: number }) => {
    return (
      <>
        <p>index={props.index}</p>
        {/* <Chat {...chatState} {...actions} /> */}
      </>
    );
  };
  return (
    <>
      <h1>N Chats</h1>
      <div>
        <label>Chat Count</label>
        <input
          name="chatCount"
          onChange={onChangeChatCount}
          ref={chatCountInputRef}
          type="number"
          step="1"
          min="1"
          value={chatCount}
        />
      </div>
      <br />
      <FlexColumns count={chatCount} Child={SingleChat} />
    </>
  );
};
