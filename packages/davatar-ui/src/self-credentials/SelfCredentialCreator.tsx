import * as React from "react";

type Named = { name: string };
interface ICredential<Subject> {
  credentialSubject: Subject;
}
type ICredentialCreationOptions<Subject> = {
  credentialSubject: Subject;
};
export type ICredentialCreator<Subject, Credential = unknown> = (
  options: ICredentialCreationOptions<Subject>
) => Promise<Credential>;

export type ISelfCredentialCreatorProps<Subject> = {
  createCredential: ICredentialCreator<Subject>;
};
// eslint-disable-next-line @typescript-eslint/ban-types
export const SelfCredentialCreator = function (
  props: ISelfCredentialCreatorProps<Named>
) {
  const [name, setName] = React.useState("");
  const nameInputRef = React.useRef<HTMLInputElement | null>(null);
  const onNameInputChange = React.useCallback(() => {
    const currentNameValue = nameInputRef?.current?.value || "";
    setName(currentNameValue);
  }, []);
  const [credential, setCredential] = React.useState<null | unknown>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const credential = await props.createCredential({
          credentialSubject: {
            name,
          },
        });
        setCredential(credential);
      } catch (error) {
        console.error("error creating credential", error);
        setCredential(null);
      }
    })();
  }, [name, props]);
  return (
    <>
      <h1>SelfCredentialCreator</h1>
      <p>
        This will help you use you issue a Verifiable Credential about yourself
        so you can use it to assert your decentralized identity.
      </p>
      <p>What is your name?</p>
      <form>
        <input
          ref={nameInputRef}
          type="text"
          name="name"
          onChange={onNameInputChange}
        />
      </form>
      <p>Your name is {name}.</p>
      <p>Your credential is:</p>
      <pre style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
        {JSON.stringify(credential, null, 2)}
      </pre>
      <p>
          <button>Save Credential</button>
      </p>
    </>
  );
};
