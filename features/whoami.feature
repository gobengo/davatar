
Feature: whoami 

  @accessWhoAmI
  Scenario: Accessing whoami
    Given a running app
    When I navigate to /whoami
    Then I see the whoami screen
