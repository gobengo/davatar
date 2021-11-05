Feature: OpenID Connect
    @sendAuthenticationRequest
    Scenario: Sending an AuthenticationRequest
        Given a running app
        # When the app receives an AuthenticationRequest
        # Then the app responds with an AuthenticationResponse

    @accessOidcTester
    Scenario: Access OIDC Tester
        Given a running app
        Given devtools are open
        Given the user has navigated to OIDC Tester
        Then the user sees the OIDC Tester
