import * as React from "react";
import { useAuthentication } from "./authentication-react";

export default function WhoamiScreen() {
    const authentication = useAuthentication().state;
    return <>
        <div data-testid="WhoamiScreen"></div>
        <pre>{JSON.stringify(authentication, null, 2)}</pre>
    </>;
}
