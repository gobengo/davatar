import * as React from "react";
import type { IKey } from "./types";

export const KeyList = (props: { cryptoKeys: Array<IKey> }) => {
  console.log('KeyList', props);
  return <>{
    props.cryptoKeys.map(cryptoKey => {
      return <div key={cryptoKey.kid}>
        <KeyListItem cryptoKey={cryptoKey} />
      </div>;
    })
  }</>;
};

export const KeyListItem = (props: { cryptoKey: IKey }) => {
  const { cryptoKey } = props;
  console.log('keyListItem', cryptoKey);
  return (
    <>
      <dl>
        <dt>kid</dt>
        <dd>{cryptoKey.kid}</dd>
        <dt>type</dt>
        <dd>{cryptoKey.type}</dd>
        <dt>publicKeyHex</dt>
        <dd>{cryptoKey.publicKeyHex}</dd>
      </dl>
    </>
  );
};
