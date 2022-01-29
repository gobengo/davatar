import * as React from "react";
import type { IIdentifier } from "./types";

type MaybePromise<T> = T | Promise<T>;

// eslint-disable-next-line @typescript-eslint/ban-types
export const DidBrowser = function (props: {
  dids: Array<MaybePromise<IIdentifier>>;
  createDid?: () => void;
}) {
  return (
    <>
      {props.createDid ? (
        <>
          <button onClick={props.createDid}>+</button>
        </>
      ) : (
        ""
      )}
      {props.dids.map((did, index) => (
        <div key={index}>
          <DidListItem did={did} />
        </div>
      ))}
    </>
  );
};

function DidListItem(props: { did: MaybePromise<IIdentifier> }) {
  const [did, setDid] = React.useState<null | IIdentifier>(null);
  React.useEffect(() => {
    (async () => {
      setDid(await Promise.resolve(props.did));
    })();
  }, [props.did]);
  return <>{did ? did.did : ""}</>;
}
