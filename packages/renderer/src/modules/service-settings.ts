import type { JSONSchemaType } from 'ajv';
import Ajv from 'ajv';

export interface IEd25519KeyPair2020 {
  name?: string;
  id?: string;
  type: 'Ed25519KeyPair2020';
  controller?: string;
  publicKeyMultibase: string;
  privateKeyMultibase: string;
}

export type IKeyPair = IEd25519KeyPair2020;
export interface ISettings {
  keyPairs: Array<IKeyPair>;
}
export const exampleEd25519KeyPair2020: IKeyPair = {
  id: 'did:key:z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP',
  type: 'Ed25519KeyPair2020',
  controller: 'did:key:z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP',
  publicKeyMultibase: 'z6Mkf5rGMoatrSj1f4CyvuHBeXJELe9RPdzo2PKGNCKVtZxP',
  privateKeyMultibase:
    'zrv3kJcnBP1RpYmvNZ9jcYpKBZg41iSobWxSg3ix2U7Cp59kjwQFCT4SZTgLSL3HP8iGMdJs3nedjqYgNn6ZJmsmjRm',
};

export const DidKeyPairSchema: JSONSchemaType<IKeyPair> = {
  type: 'object',
  title: 'DID KeyPair',
  examples: [exampleEd25519KeyPair2020],
  required: ['type', 'publicKeyMultibase', 'privateKeyMultibase'],
  properties: {
    controller: { type: 'string', nullable: true },
    name: { type: 'string', nullable: true },
    id: { type: 'string', nullable: true },
    type: {
      type: 'string',
      enum: ['Ed25519KeyPair2020'],
      nullable: false,
    },
    publicKeyMultibase: { type: 'string', nullable: false },
    privateKeyMultibase: { type: 'string', nullable: false },
  },
};

export const SettingsSchema: JSONSchemaType<ISettings> = {
  title: 'Settings',
  type: 'object',
  required: ['keyPairs'],
  properties: {
    keyPairs: {
      type: 'array',
      items: DidKeyPairSchema,
    },
  },
};

export interface SettingsServiceOptions {
  json?: string
  onChange?(s: ISettings): void
}
export default class SettingsService {
  options: SettingsServiceOptions;
  settings: ISettings;
  private onChange(s: ISettings) {
    if (this.options.onChange) {
      this.options.onChange(s);
    }
  }
  constructor(options: {
    json?: string
    onChange?(s: ISettings): void
  }) {
    this.settings = {
      keyPairs: [],
    };
    this.options = options;
    if (options.json) {
      this.loadJson(options.json);
    }
  }
  public save(settings: ISettings) {
    this.settings = settings;
    this.onChange(settings);
  }
  private loadJson(json: string) {
    const o = JSON.parse(json);
    const v = new Ajv();
    const validateSettings = v.compile(SettingsSchema);
    if (validateSettings(o)) {
      this.settings = o;
    }
  }
}
