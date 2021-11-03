export function assertTruthy(value: unknown): asserts value {
    if (! value) {
        throw new Error('AssertionError: value must be defined');
    }
}
