import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { Y } from "@syncedstore/core";
import { YTextEditor } from "davatar-ui";
import * as React from "react";

const defaultYjsDoc = new Y.Doc;
const defaultProps: Parameters<typeof YTextEditor>[0] = {
    text: defaultYjsDoc.getText('text'),
};

export default {
  title: "editor-quill/YTextEditor",
  component: YTextEditor,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof YTextEditor>;

export const WithDefaultProps: ComponentStory<typeof YTextEditor> = (args) => {
    return <>
        <YTextEditor {...args} />
    </>;
};

export const Collaboration: ComponentStory<typeof YTextEditor> = (args) => {
    const numPeers = 2;
    return <>
        <div style={{display: 'flex'}}>
    {new Array(numPeers).fill(0).map((e,index) => <>
            <li key={index}>
                <YTextEditor {...args} />
            </li>
    </>)}
        </div>
    </>;
};