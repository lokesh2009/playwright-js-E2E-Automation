Feature: Validate client IP page for many sites
  Check that each site returns the expected client IP and header values at /default.asp?page=xxtest
  @allconfiguredsites @smoke
  Scenario: Validate all configured sites
    Given the list of sites is loaded
    When I request the default xxtest page for each site
    Then each response should include the expected IP and header values
