import * as React from 'react';
import type { JSONSchema7 } from 'json-schema';
import Form from '@rjsf/material-ui';
import type { ISettings } from './service-settings';
import { SettingsSchema, exampleEd25519KeyPair2020 } from './service-settings';

const EmptySettings = (): ISettings => ({
  keyPairs: [],
});

export default function DavatarSettingsScreen(props: {
  initialSettings?: ISettings;
  onSettingsChange?: (settings: ISettings) => void;
}) {
  console.log('DavatarSettingsScreen', props);
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
      return newState;
    },
    props.initialSettings || EmptySettings(),
  );
  const [settingsVersion, setSettingsVersion] = React.useState(0);
  React.useEffect(() => {
    setSettingsVersion(x => x + 1);
  }, [settings]);
  React.useEffect(
    () => {
      if (settingsVersion > 1) {
        if (props.onSettingsChange) {
          props.onSettingsChange(settings);
        }
      }
    },
    [settingsVersion],
  );
  function importExampleKeyPair() {
    dispatch({
      type: 'importExampleDidKeyPair',
    });
  }
  return (
    <>
      <span data-test-id="davatar-screen-settings"></span>
      <Form
        liveValidate={true}
        schema={SettingsSchema as JSONSchema7}
        formData={settings}
        onChange={(event) => {
          if (event.errors.length) {
            console.debug('form changed, but there are errors. Wont setFormData', event);
            return;
          }
          dispatch({
            type: 'setFormData',
            payload: event.formData,
          });
        }}
      ></Form>

      <h2>Debugging</h2>
      <button onClick={importExampleKeyPair}>Import Example KeyPair</button>
    </>
  );
}
