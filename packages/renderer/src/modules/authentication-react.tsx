import * as React from "react";
import type { AuthenticationResponse } from "./openid-connect";

export interface IAuthenticationActions {
  handleAuthenticationResponse(response: AuthenticationResponse): void;
}

export interface IAuthenticationState {
  response: AuthenticationResponse | null;
}

export interface IAuthenticationContext {
  state: IAuthenticationState;
  actions: IAuthenticationActions;
}

export const DefaultAuthenticationState = (): IAuthenticationState => {
  return {
    response: null,
  };
};

export const DefaultAuthenticationContext = (): IAuthenticationContext => {
  return {
    state: DefaultAuthenticationState(),
    actions: {
      handleAuthenticationResponse(response) {
        console.debug('DefaultAuthenticationContext.handleAuthenticationResponse', response);
      },
    },
  };
};

export const AuthenticationContext = React.createContext<IAuthenticationContext>(
  DefaultAuthenticationContext()
);

/**
 * React hook to use authentication
 */
export function useAuthentication() {
  const authenticationStateFromContext = React.useContext(
    AuthenticationContext
  );
  return authenticationStateFromContext;
}

export function AuthenticationProvider(props: {
  children: React.ReactNode
  initialAuthenticationState: IAuthenticationState
  onChange: (authenticationState: IAuthenticationState) => void
}) {
  const [authenticationState, setAuthenticationState] = React.useState<IAuthenticationState>(props.initialAuthenticationState);
  const context = React.useMemo<IAuthenticationContext>(
    () => {
      return {
        state: authenticationState,
        actions: {
          handleAuthenticationResponse(response) {
            setAuthenticationState(prev => {
              return {
                ...prev,
                response,
              };
            });
          },
        },
      };
    },
    [authenticationState],
  );
  return <>
  <AuthenticationContext.Provider value={context}>
    {props.children}
  </AuthenticationContext.Provider>
  </>;
}
