@Healthcheck
Feature: New Inventory Link Validation - QA Environments
  As a QA Engineer
  I want to verify all links on the New Inventory page of the QA servers
  So that I can identify broken links before production deployment

  @Healthcheck
  Scenario Outline: Check for broken links on <siteUrl>
    Given the QA site is reachable at "<siteUrl>"
    And I navigate to the inventory page for "<siteUrl>"
    When I extract all unique links from the page
    Then I validate each link and report failures with screenshots

    Examples:
      | siteUrl                                 |
      | https://qa-v6-ws02.test.dealerspike.net |
      | https://qa-v7-ws04.test.dealerspike.net |
