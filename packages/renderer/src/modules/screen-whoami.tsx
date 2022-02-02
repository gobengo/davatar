import * as React from "react";
import { useAuthentication } from "./authentication-react";
import { parseIdTokenClaims } from "./openid-connect";

export default function WhoamiScreen() {
  const authentication = useAuthentication().state;
  const idTokenClaims = React.useMemo(() => {
    const response = authentication.response;
    return response && parseIdTokenClaims(response.id_token);
  }, [authentication.response]);
  return (
    <>
      <div data-testid="WhoamiScreen"></div>

      <p>Authentication State</p>
      <pre>{JSON.stringify(authentication, null, 2)}</pre>

      {idTokenClaims ? (
        <>
          <p>id_token claims</p>
          <pre>{JSON.stringify(idTokenClaims, null, 2)}</pre>
        </>
      ) : (
        <>You have not authenticated.</>
      )}
    </>
  );
}
