import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { NameEditor } from "../../components/NameEditor";

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

export const WithDefaultProps = Template.bind({});

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
  return (
    <>
      <h2>Edit Your Profile</h2>
      <div style={{ display: "flex" }}>
        <div>
          <ProfileEditor profile={profile} onChange={setProfile} />
        </div>
        <div>
          <ProfilePreview profile={profile}></ProfilePreview>
        </div>
      </div>
      <h2>Example Profile</h2>
      <ExampleProfile />
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
