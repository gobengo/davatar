export function hexEncode(bytes: Uint8Array): string {
    const hex = Array.from(bytes).map(b => b.toString(16)).join('');
    return hex;
}
