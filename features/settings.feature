
Feature: Settings 

  Scenario: Accessing Settings
    Given a running app
    When I navigate to Settings
    Then I see the settings screen

  @addKeyPair
  Scenario: Adding a KeyPair
    Given a running app
    When I navigate to Settings
    When I add a key named 'scenarioAddKey'
    Then I see a key named 'scenarioAddKey'
    # And test persistence
    When the page is refreshed
    Then I see a key named 'scenarioAddKey'

  @importKeyPair
  Scenario: Importing a sample KeyPair
    Given a running app
    When the user navigates to Settings
    When the user imports a sample keyPair
    Then a keyPair is visible
    # And test persistence
    When the page is refreshed
    Then a keyPair is visible
