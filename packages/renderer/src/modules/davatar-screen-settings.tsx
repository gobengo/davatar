import * as React from 'react';
import type { JSONSchema7 } from 'json-schema';
import Form from '@rjsf/material-ui';
import type { ISettings } from './service-settings';
import { SettingsSchema, exampleEd25519KeyPair2020 } from './service-settings';

const emptySettings: ISettings = {
  keyPairs: [],
};

export default function DavatarSettingsScreen(props: {
  initialSettings?: ISettings;
  onSettingsChange?: (settings: ISettings) => void;
}) {
  type Action =
    | { type: 'setFormData'; payload: ISettings }
    | { type: 'importExampleDidKeyPair' };
  const [settings, dispatch] = React.useReducer(
    (state: ISettings, action: Action) => {
      let newState = state;
      switch (action.type) {
        case 'setFormData':
          newState = action.payload;
          break;
        case 'importExampleDidKeyPair':
          newState = {
            ...state,
            keyPairs: [...state.keyPairs, { ...exampleEd25519KeyPair2020 }],
          };
          break;
      }
      const { onSettingsChange } = props;
      if (onSettingsChange) {
        console.log('onSettingsChange', newState);
        onSettingsChange(newState);
      }
      return newState;
    },
    props.initialSettings || emptySettings,
  );
  React.useEffect(() => {
    if (props.onSettingsChange) {
      props.onSettingsChange(settings);
    }
  }, [settings]);
  function importExampleKeyPair() {
    dispatch({
      type: 'importExampleDidKeyPair',
    });
  }
  return (
    <>
      <span data-test-id="davatar-screen-settings"></span>
      <Form
        schema={SettingsSchema as JSONSchema7}
        formData={settings}
        onChange={(event) =>
          dispatch({
            type: 'setFormData',
            payload: event.formData,
          })
        }
      ></Form>

      <h2>Debugging</h2>
      <button onClick={importExampleKeyPair}>Import Example KeyPair</button>
    </>
  );
}
