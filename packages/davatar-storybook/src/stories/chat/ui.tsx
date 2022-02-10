import * as React from "react";

export function FlexColumns(props: {
    count: number;
    Child: (props: { index: number }) => JSX.Element;
  }) {
    const { Child } = props;
    return (
      <>
        <div style={{ display: "flex" }}>
          {new Array(props.count).fill(undefined).map((chat, index) => (
            <div key={index} style={{ flex: "1 1 auto" }}>
              <Child index={index} />
            </div>
          ))}
        </div>
      </>
    );
  }
  