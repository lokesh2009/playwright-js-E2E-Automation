
@smoke @ui
Feature: Amazon Product Search (UI)

  As a customer
  I want to search for products on Amazon
  So that I can view relevant results quickly

  @ui
  Scenario: Search for a product and verify that results appear
    Given I am on the Amazon home page
    When I search for "Wireless Headphones"
    Then I should see the search results displayed
