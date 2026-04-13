@Inventory @filters @smoke @Goldenset
Feature: Inventory Filters - Corrected

  Scenario: Inventory filters work correctly - Fixed
    Description: Validate inventory filtering by make and category (Corrected - uses valid make not category)
    Given User opens "https://automationsandbox-v7.clients.dealerspike.net/default.asp?page=xAllInventory&pg=1" site in browser
    When I select category "Motorcycles" from categories filter
    Then the results should be filtered by category "Motorcycles"
    When I select make "Harley-Davidson" from makes filter
    Then the results should be filtered by make "Harley-Davidson"

  @smoke
  Scenario: Filter by valid Honda make
    Given User opens "https://automationsandbox-v7.clients.dealerspike.net/default.asp?page=xAllInventory&pg=1" site in browser
    When I select make "Honda" from makes filter
    Then the results should be filtered by make "Honda"

  @smoke
  Scenario: Filter by Yamaha make
    Given User opens "https://automationsandbox-v7.clients.dealerspike.net/default.asp?page=xAllInventory&pg=1" site in browser
    When I select make "Yamaha" from makes filter
    Then the results should be filtered by make "Yamaha"


    @smoke
  Scenario: 
    Given User opens "https://automationsandbox-v7.clients.dealerspike.net" site in browser
    When I click on showroom breadcrumb and select "All inventory"
    And I should be navigated to inventory page
    Then  I should connect with DB and fetch inventory details
    Then matched the results with UI and DB and validate the results
