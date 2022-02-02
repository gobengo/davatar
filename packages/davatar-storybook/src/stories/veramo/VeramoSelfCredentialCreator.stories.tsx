import * as React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import type { ICredentialCreator } from "davatar-ui";
import { SelfCredentialCreator } from "davatar-ui";
import tweetnacl from "tweetnacl";
import { veramoAgent } from "./veramo";
import type { IIdentifier } from "@veramo/core";

export default {
  title: "veramo/VeramoSelfCredentialCreator",
  component: VeramoSelfCredentialCreator,
} as ComponentMeta<typeof VeramoSelfCredentialCreator>;

const Template: ComponentStory<typeof VeramoSelfCredentialCreator> = (args) => {
  return (
    <>
      <VeramoSelfCredentialCreator {...args} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  count: 10,
};

type CredentialSubject = {
  name: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
function VeramoSelfCredentialCreator(props: {}) {
  const [issuerIdentifier, setIssuerIdentifier] =
    React.useState<null | IIdentifier>(null);
  React.useEffect(() => {
    (async () => {
      const identifier: IIdentifier = await veramoAgent.didManagerGetOrCreate();
      setIssuerIdentifier(identifier);
    })();
  }, []);
  const ed25519PublicKeyHex = React.useMemo(() => {
    const firstKey = issuerIdentifier?.keys[0];
    return firstKey?.publicKeyHex;
  }, [issuerIdentifier]);
  const createCredential: ICredentialCreator<CredentialSubject> = async (
    options
  ) => {
    return { credentialSubject: options.credentialSubject };
  };
  const veramoCreateCredential: ICredentialCreator<CredentialSubject> = async (
    options
  ) => {
    const issuerDid = issuerIdentifier?.did;
    if (!issuerDid) {
      throw new Error(
        "Cannot create credential because cant determine issuer did"
      );
    }
    const credential = await veramoAgent.createVerifiableCredential({
      credential: {
        credentialSubject: {
          id: issuerDid,
          ...options.credentialSubject,
        },
        issuer: issuerDid,
      },
      proofFormat: "jwt" as const,
    });
    return credential;
  };
  return (
    <>
      <h1>VeramoSelfCredentialCreator</h1>
      <h2>identifier</h2>
      {issuerIdentifier ? (
        <>
          <p>Your did is {issuerIdentifier.did}</p>
          <details>
            <summary>DID Details</summary>
            <pre>{JSON.stringify(issuerIdentifier, null, 2)}</pre>
          </details>
          <SelfCredentialCreator
            createCredential={veramoCreateCredential}
          ></SelfCredentialCreator>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
