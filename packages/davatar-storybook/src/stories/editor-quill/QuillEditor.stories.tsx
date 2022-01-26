import type { ComponentMeta, ComponentStory } from "@storybook/react";
import { QuillEditor } from "davatar-ui";
import * as React from "react";

const defaultProps: Parameters<typeof QuillEditor>[0] = {
    placeholder: 'QuillEditor placeholder ...',
    toolbar: false,
};

export default {
  title: "editor-quill/QuillEditor",
  component: QuillEditor,
  args: {
    ...defaultProps,
  },
} as ComponentMeta<typeof QuillEditor>;

export const WithDefaultProps: ComponentStory<typeof QuillEditor> = (args) => {
    return <>
        <QuillEditor {...args} />
    </>;
};
