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
import WebRTCStar from "libp2p-webrtc-star";
import { NOISE } from "libp2p-noise";
import type { Multiaddr } from "libp2p/src/upgrader";
import * as MPLEX from "libp2p-mplex";
import GossipSub from "libp2p-gossipsub";
import Bootstrap from 'libp2p-bootstrap';

export default {
  title: "chat/p2p Chat",
};

function useP2pChatState(): [IChatState, IChatActions, Libp2p | null] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [p2p, setP2p] = React.useState<null | Libp2p>(null);
  const [multiaddrs, setMultiaddrs] = React.useState<Array<Multiaddr>>([]);
  React.useEffect(() => {
    let p2p: Libp2p;
    (async () => {
      p2p = await Libp2p.create({
        modules: {
          transport: [WebRTCStar],
          streamMuxer: [MPLEX],
          connEncryption: [NOISE],
          pubsub: GossipSub,
          peerDiscovery: [Bootstrap],
        },
        config: {
          peerDiscovery: {
            [Bootstrap.tag]: {
                list: [ // a list of bootstrap peer multiaddrs to connect to on node startup
                  "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
                  "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
                  "/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
                  ],
                  interval: 5000, // default is 10 ms,
                  enabled: true,
                  autoDial: true,
            },
            autoDial: true,
          },
          pubsub: {
            enabled: true,
            emitSelf: true,
          },
        },
        addresses: {
          // add a listen address (localhost) to accept TCP connections on a random port
          listen: [
            // "/ip4/127.0.0.1/tcp/0",
            "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
            "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
          ],
        },
      });

      console.log('useP2pChatState starting p2p');
      await p2p.start();


      // console.log("libp2p has started");
      // print out listening addresses
      // console.log("listening on addresses:");
      // p2p.multiaddrs.forEach((addr) => {
      //   console.log(`${addr.toString()}/p2p/${p2p.peerId.toB58String()}`);
      //   setMultiaddrs((addrs) => [...addrs, addr]);
      // });
      // Listen for new peers
      // p2p.on("peer:discovery", (peerId) => {
      //   console.log(`Found peer ${peerId.toB58String()}`);
      // });

      // Listen for new connections to peers
      // p2p.connectionManager.on("peer:connect", (connection) => {
      //   console.log(`Connected to ${connection.remotePeer.toB58String()}`);
      // });

      // Listen for peers disconnecting
      // p2p.connectionManager.on("peer:disconnect", (connection) => {
      //   console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
      // });
      setP2p(p2p);
    })();
    return () => {
      if (!p2p) {
        return;
      }
      console.log('useP2pChatState stopping p2p');
      p2p.stop();
    };
  }, []);
  const [chatState, actions0] = useChatState();
  const actions = {
    ...actions0,
    onMessageContent(content: IChatMessageContent) {
      console.log("useP2pChatState onMessageContent", content);
    },
  };
  return [chatState, actions, p2p];
}

function useP2pState(p2p: Libp2p | null) {
  const [peers, setPeers] = React.useState([] as Array<IP2pPeer>);
  const [connections, setConnections] = React.useState(
    [] as Array<IP2pConnection>
  );
  React.useEffect(() => {
    if (!p2p) return;
    function onPeerConnect(connection: IP2pConnection) {
      console.log("onPeerConnect");
      setConnections((conns) => [...conns, connection]);
    }
    function onPeerDiscovery(peer: IP2pPeer) {
      setPeers((peers) => [...peers, peer]);
    }
    // console.log("listening p2p.on peer:connect");
    p2p.on("peer:connect", onPeerConnect);
    p2p.on("peer:discovery", onPeerDiscovery);
    return () => {
      p2p.off("peer:connect", onPeerConnect);
      p2p.off("peer:discovery", onPeerDiscovery);
    };
  }, [p2p]);
  const state = React.useMemo(() => {
    return { peers, connections };
  }, [peers, connections]);
  return state;
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
  const [chatState, actions, p2p] = useP2pChatState();
  const p2pState = useP2pState(p2p);
  // React.useEffect(() => {
  //   if (!p2p) return;
  //   console.log('NChats starting p2p');
  //   p2p.start();
  //   return () => {
  //     console.log('NChats stopping p2p');
  //     p2p.stop();
  //   };
  // }, [p2p]);
  const SingleChat = React.useCallback(
    (props: { index: number }) => {
      return (
        <>
          <p>index={props.index}</p>
          <h2>p2p stats</h2>
          {p2p ? (
            <>
              <P2pStats p2p={p2p} {...p2pState} />
            </>
          ) : (
            <></>
          )}
          <h2>Chat</h2>
          <Chat {...chatState} {...actions} />
        </>
      );
    },
    [chatState, actions, p2p, p2pState]
  );
  return (
    <>
      <h1>N Chats</h1>
      {p2p ? (
        <>
          <PubsubTester p2p={p2p} />
        </>
      ) : (
        <></>
      )}
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

interface IP2pConnection {
  remotePeer: IP2pPeer;
}

function isP2pConnection(object: unknown): object is IP2pConnection {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (object as any)?.remotePeer?.toB58String === "function") {
    return true;
  }
  return false;
}

interface IP2pPeer {
  toB58String(): string;
}

function P2pStats(props: { p2p: Libp2p; peers: Array<IP2pPeer> }) {
  const { p2p, peers } = props;
  return (
    <>
      <h2>Peer ID</h2>
      <p>{p2p.peerId.toString()}</p>
      <h2>Peers</h2>
      <details>
        <summary>{peers.length} Peers</summary>
        <ul>
          {Array.from(peers).map((peer) => {
            const peerString = peer.toB58String();
            return <li key={peerString}>{peerString}</li>;
          })}
        </ul>
      </details>
    </>
  );
}

function PubsubTester(props: { p2p: Libp2p }) {
  const { p2p } = props;
  const topic = 'a';
  const onClickPublish = React.useCallback(async () => {
    const message = `Hi ben ${Math.random().toString().slice(2)}`;
    const messageBytes = new TextEncoder().encode(message);
    const publishResult = await p2p.pubsub.publish(topic, messageBytes);
  }, [p2p.pubsub]);
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onMessage(message: any) {
      console.log("got message on topic a", message);
    }
    console.log('listening on', topic);
    p2p.pubsub.on(topic, onMessage);
    p2p.pubsub.subscribe(topic);
    return () => {
      console.log('PubsubTester stop pubsub on topic', topic);
      p2p.pubsub.off(topic, onMessage);
    };
  }, [p2p.pubsub]);
  return (
    <>
      <h2>PubSub</h2>
      <button onClick={onClickPublish}>Publish on channel a</button>
    </>
  );
}
