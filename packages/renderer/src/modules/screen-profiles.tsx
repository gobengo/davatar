import type { JSONSchemaType } from "ajv";
import { assertTruthy } from "./assert";
import type TestingLibraryContext from "./davatar-cucumber-contexts/TestingLibraryContext";
import { JsonSchemaForm } from "./json-schema-form";
import * as assert from "assert";
import type { FieldTemplateProps } from "@rjsf/core";
import * as React from "react";
import type { ElementHandle } from "playwright-testing-library/dist/typedefs";

interface IProfile {
    name: string;
    claims: IClaims
}

interface IClaims {
    preferred_username: string
    email: string
}

const ClaimsSchema: JSONSchemaType<IClaims> = {
    type: 'object',
    properties: {
        preferred_username: { type: 'string', nullable: false },
        email: { type: 'string', format: 'email', nullable: false },
    },
    required: [],
};

const ProfileSchema: JSONSchemaType<IProfile> = {
    type: 'object',
    required: ['claims', 'name'],
    properties: {
        name: { type: 'string' },
        claims: ClaimsSchema,
    },
};

const ProfileArraySchema: JSONSchemaType<Array<IProfile>> = {
    type: 'array',
    items: ProfileSchema,
};

export default function ProfilesScreen() {
    return <>
        <div data-testid="ProfilesScreen"></div>
        <h1>ProfilesScreen</h1>
        <ProfilesForm />
    </>;
}

function ProfilesForm() {
    const ProfileItemTemplate = React.useMemo(() => FieldTemplateWithTestid('form-profile'), []);
    const ProfileNameTemplate = React.useMemo(() => FieldTemplateWithTestid('form-profile-name'), []);    
    return <>
        <JsonSchemaForm
            liveValidate={true}
            schema={ProfileArraySchema}
            uiSchema={{
                items: {
                    'ui:FieldTemplate': ProfileItemTemplate,
                    name: {
                        'ui:FieldTemplate': ProfileNameTemplate,
                    },
                },
            }}
        />
    </>;
}

export class ProfilesScreenPageController {
    constructor(
        protected testingLibrary: TestingLibraryContext,
    ) {}
    public async createProfile() {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const createProfileButton = await this.testingLibrary.queries.getByText(document, 'Add Item');
        await createProfileButton.click();
        // now new form should have appeared
        const form = await this.queryLatestCreateProfileForm();
        assert.ok(form);
        await this.fillProfileForm(form, {
            name: 'createProfile test profile',
            claims: {
                preferred_username: 'createProfileUsername',
                email: 'createProfile@example.com',
            },
        });
    }

    protected async fillProfileForm(form: ElementHandle, profile: IProfile) {
        const nameInput = await form.$(`*[data-testid='form-profile-name'] input`);
        assertTruthy(nameInput);
        await nameInput.fill(profile.name);
    }

    protected async queryLatestCreateProfileForm() {
        const document = await this.testingLibrary.getDocument();
        assertTruthy(document);
        const forms = await this.testingLibrary.queries.getAllByTestId(document, 'form-profile');
        if ( ! forms.length) {
            return null;
        }
        const lastForm = forms[forms.length-1];
        return lastForm;
    }
}

function FieldTemplateWithTestid(testid: string) {
    return (props: FieldTemplateProps) => {
        console.log('rendering FieldTemplateWithTestid', testid, props);
        const {classNames, help, description, errors, children} = props;
        return (
          <div className={classNames} data-testid={testid}>
            {description}
            {children}
            {errors}
            {help}
          </div>
        );
    };
}
