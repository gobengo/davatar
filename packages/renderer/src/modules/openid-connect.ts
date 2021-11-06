import type { JWK } from "jose";

export type ResponseType = 'id_token' | 'code' | 'token'

export type GrantType = 'authorization_code' | 'implicit' | 'refresh_token'

// https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
export interface ClientRegistration {
  redirect_uris: string[]
  request_object_signing_alg: 'none'
  // default: ['code']
  response_types?: Array<ResponseType>
  //  If omitted, the default is that the Client will use only the authorization_code Grant Type. 
  grant_types?: Array<GrantType>
  // default: web
  application_type?: 'native' | 'web'
  client_name?: string
  client_uri?: string
  logo_uri?: string
  policy_uri?: string
  tos_uri?: string
  jwks?: { keys: Array<JWK> }
}

export interface AuthenticationRequest {
  response_type: string
  redirect_uri: string
  state: string
  client_id: string
  scope: string
  nonce: string
  registration?: ClientRegistration
  claims?: AuthenticationRequestClaims
}

export type ClaimsDescriptor = Record<
  string,
  null | {
    essential?: boolean;
    value?: string;
    values?: string[];
  }
>;

export interface AuthenticationRequestClaims {
  id_token?: ClaimsDescriptor;
  userinfo?: ClaimsDescriptor;
}

export class AuthenticationRequest implements AuthenticationRequest {
  constructor(
    public response_type: string,
    public client_id: string,
    public redirect_uri: string,
    public scope: string,
    public state: string,
    public nonce: string,
    public claims?: AuthenticationRequestClaims,
    public registration?: ClientRegistration
  ) {}

  static fromUrl(searchParams: URLSearchParams) {
    return new AuthenticationRequest(
      searchParams.get("response_type") || "",
      searchParams.get("client_id") || "",
      searchParams.get("redirect_uri") || "",
      searchParams.get("scope") || "",
      searchParams.get("state") || "",
      searchParams.get("nonce") || "",
      (() => {
        const claimsSearchParam = searchParams.get("claims");
        return claimsSearchParam && JSON.parse(claimsSearchParam);
      })(),
      (() => {
        const registrationParam = searchParams.get("registration");
        return registrationParam && JSON.parse(registrationParam);
      })(),
    );
  }
}

export interface AuthenticationResponse {
  state: string;
  id_token: string;
}