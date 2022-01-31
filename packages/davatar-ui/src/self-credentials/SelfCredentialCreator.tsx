import * as React from "react";

type Named = { name: string };
interface ICredential<Subject> {
    credentialSubject: Subject
}
type ICredentialCreationOptions<Subject> = {
    credentialSubject: Subject
}
export type ICredentialCreator <Subject> = (options: ICredentialCreationOptions<Subject>) => ICredential<Subject>;

export type ISelfCredentialCreatorProps<Subject> = {
    ed25519PublicKeyHex: string;
    createCredential: ICredentialCreator<Subject>;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export const SelfCredentialCreator = function (props: ISelfCredentialCreatorProps<Named>) {
    const [name, setName] = React.useState('');
    const nameInputRef = React.useRef<HTMLInputElement|null>(null);
    const onNameInputChange = React.useCallback(
        () => {
            const currentNameValue = nameInputRef?.current?.value || '';
            setName(currentNameValue);
        },
        [],
    );
    const credential = React.useMemo(
        () => {
            return props.createCredential({
                credentialSubject: {
                    name,
                },
            });
        },
        [name],
    );
    return <>
        <h1>SelfCredentialCreator</h1>
        <p>
            This will help you use you issue a Verifiable Credential about yourself so you can use it to assert your decentralized identity.
        </p>
        <h2>Keys</h2>
        <p>Your public key is {props.ed25519PublicKeyHex}</p>
        <p>
            What is your name?
        </p>
        <form>
            <input ref={nameInputRef} type="text" name="name" onChange={onNameInputChange} />
        </form>
        <p>
            Your name is {name}.
        </p>
        <p>Your credential is:</p>
        <pre>{JSON.stringify(credential, null, 2)}</pre>
    </>;
};
