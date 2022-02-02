import * as BufferModule from "buffer/";

// define this for any dependencies that expect this nodejs global
globalThis.Buffer = BufferModule.Buffer;

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  parameters: {
    chromatic: {
      // https://www.chromatic.com/docs/ignoring-elements#ignore-stories
      disableSnapshot: false
    },
  }
}
