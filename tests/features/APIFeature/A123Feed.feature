Feature: Compare dealer data from two APIs

  Scenario: Validate dealer data consistency between API1 and API2
    Given I fetch dealer data from API1
    And I fetch dealer data from API2
    When I compare the dealer data for dealer ID "12345"
    Then the data should match across both APIs
