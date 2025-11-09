Feature: Broken Link Validation

  Scenario: Check for broken links across multiple websites
    Given a list of categorized URLs
    When I visit each site and validate all links
    Then I should generate a CSV report of broken links