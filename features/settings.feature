
Feature: Settings 

  Scenario: Accessing Settings
    Given a running app
    When I navigate to Settings
    Then I see the settings screen

  Scenario: Adding a Key
    Given a running app
    When I navigate to Settings
    When I add a key named scenarioAddKey
    Then I see a key named scenarioAddKey
