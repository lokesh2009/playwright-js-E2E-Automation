Feature: Admin Login
  As an admin user
  I want to be able to log in to the admin console
  So that I can reach protected pages

  Scenario: Admin can log in with valid credentials
    Given I navigate to the admin login page
    When I log in with valid admin credentials
    Then I should be logged in to the admin console
