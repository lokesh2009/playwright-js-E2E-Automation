@ui @xinv
Feature: XInv Manager - Inventory operations
  Verify basic flows on the XInv Manager admin page

  Background:
    Given the XInv Manager admin page is available
    And admin credentials are configured

  @smoke
  Scenario: Search for an inventory item
    When I navigate to the XInv Manager
    And I search XInv for "motorcycle"
    Then I should see at least one search result
@smoke
  Scenario: Verify XInv Manager page header is displayed
    When I navigate to the XInv Manager
    Then I should see the XInv Manager header
@smoke
  Scenario: Validate pagination on XInv Manager page
    When I navigate to the XInv Manager URL "https://powersports-v7-complex.sbx.dsp.leadventure.dev/"
    Then I should see pagination controls
    And I should be able to navigate through pages
    And I click on "new inventory page"
