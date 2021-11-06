Feature: OpenID Connect
    @sendAuthenticationRequest
    Scenario: Sending an AuthenticationRequest
        Given a running app
        # When the app receives an AuthenticationRequest
        # Then the app responds with an AuthenticationResponse

    @accessOidcTester
    Scenario: Access OIDC Tester
        Given a running app
        Given the user has navigated to OIDC Tester
        Then the user sees the OIDC Tester

    @authenticateWithOidcTester
    Scenario: Authenticate with OIDC Tester
        Given a running app
        Given the user has navigated to OIDC Tester
        When the user initiates authentication
        Then the user sees the authentication flow
