import type { FormProps } from '@rjsf/core';
import Form from '@rjsf/material-ui';
import type { JSONSchemaType } from 'ajv';
import type { JSONSchema7 } from 'json-schema';

export function JsonSchemaForm<T,U>(props: Omit<FormProps<T>, 'schema'> & {
    // allow JSONSchema from ajv
    schema: FormProps<T>['schema'] | JSONSchemaType<U>
}) {
    const { schema, ...restProps } = props;
    return <Form schema={schema as JSONSchema7} {...restProps} />;
}
