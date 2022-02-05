import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { NameEditor } from "../../components/NameEditor";
import * as dagPB from '@ipld/dag-pb';
import canonicalize from "canonicalize";
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';

interface ISchemaOrgPerson {
  "@context": "http://schema.org";
  "@type": "Person";
  name: string;
}

type IProfileDescriptor = ISchemaOrgPerson;

interface IProfile {
  type: "Profile";
  // "An object MUST have one or more descriptors."
  descriptors: [IProfileDescriptor, ...IProfileDescriptor[]];
}

interface IProfileWrite {
    data?: IProfile
    descriptor: {
        cid: string
        method: 'ProfileWrite'
        dataFormat: 'json'
        encryption?: 'jwe'
    }
}

async function createProfileWrite(profile: IProfile): Promise<IProfileWrite> {
    const profileString = canonicalize(profile);
    const profileDagPbBytes = dagPB.encode({
        Data: (new TextEncoder).encode(profileString),
        Links: [],
    });
    const cid = CID.create(1, dagPB.code, await sha256.digest(profileDagPbBytes));
    const write: IProfileWrite = {
        data: profile,
        descriptor: {
            cid: cid.toString(),
            method: 'ProfileWrite',
            dataFormat: 'json',
        },
    };
    return write;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function ProfileEditor(props: {
  profile: IProfile;
  onChange(profile: IProfile): void;
}) {
  const { profile, onChange } = props;
  const firstDescriptor = props.profile.descriptors[0];
  const onChangeFirstDescriptor = React.useCallback(
    (value: ISchemaOrgPerson) => {
      const [oldFirstDescriptor, ...nonFirstDescriptors] = profile.descriptors;
      const newProfile: IProfile = {
        ...profile,
        descriptors: [value, ...nonFirstDescriptors],
      };
      onChange(newProfile);
    },
    [profile, onChange]
  );
  if (firstDescriptor["@type"] !== "Person") {
    return (
      <>Profile descriptor has unexpected type {firstDescriptor["@type"]}</>
    );
  }
  return (
    <>
      <PersonEditor
        value={firstDescriptor}
        onChange={onChangeFirstDescriptor}
      />
    </>
  );
}

function PersonEditor(props: {
  value: ISchemaOrgPerson;
  onChange(person: ISchemaOrgPerson): void;
}) {
  const onNameChange = React.useCallback(
    (changes: { name: string }) => {
      props.onChange({
        ...props.value,
        ...changes,
      });
    },
    [props]
  );
  return (
    <>
      <NameEditor initialValue={props.value} onSave={onNameChange} />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-types
function ProfilePreview(props: { profile: IProfile }) {
  return (
    <>
      <pre>{JSON.stringify(props.profile, null, 2)}</pre>
    </>
  );
}

export default {
  title: "dif-id-hub/ProfileEditor",
  //   component: ProfileEditor,
  //   args: {
  //     ...defaultProps,
  //   },
} as ComponentMeta<typeof ProfileEditor>;

const Template: ComponentStory<typeof ProfileEditor> = (args) => {
  return <ProfileEditor {...args} />;
};

export const SampleProfileEditor = function () {
  const [profile, setProfile] = React.useState<IProfile>({
    type: "Profile",
    descriptors: [
      {
        "@context": "http://schema.org",
        "@type": "Person",
        name: "bengo",
      },
    ],
  });
  const [profileWrite, setProfileWrite] = React.useState<null|IProfileWrite>(null);
  React.useEffect(
      () => {
          createProfileWrite(profile).then(setProfileWrite);
      },
      [profile],
  );
  return (
    <>
      <h2>Edit Your Profile</h2>
      <div>
        <div>
          <ProfileEditor profile={profile} onChange={setProfile} />
        </div>
        <div>
          <h3>Profile</h3>
          <ProfilePreview profile={profile}></ProfilePreview>
          <h3>ProfileWrite</h3>
          <pre>{JSON.stringify(profileWrite, null, 2)}</pre>
        </div>
      </div>
    </>
  );
};

export const ExampleProfile = function () {
  return (
    <>
      <p>This is from the id hub docs</p>
      <pre>
        {JSON.stringify(
          {
            type: "Profile",
            descriptors: [
              {
                "@context": "http://schema.org",
                "@type": "Person",
                name: "Jeffrey Lebowski",
                givenName: "Jeffery",
                middleName: "The Big",
                familyName: "Lebowski",
                description: "That's just, like, your opinion, man.",
                website: "https://ilovebowling.com",
                email: "jeff@ilovebowling.com",
                image: "IMG_URL",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "5227 Santa Monica Boulevard",
                  addressLocality: "Los Angeles",
                  addressRegion: "CA",
                },
              },
            ],
          },
          null,
          2
        )}
      </pre>
    </>
  );
};
