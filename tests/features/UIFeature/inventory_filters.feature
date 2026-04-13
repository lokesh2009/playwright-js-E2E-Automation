Feature: Public Inventory filters and search
 
  As a user I want to verify inventory search, sort and filter controls on the public inventory page so that customers can find vehicles
 
  @P1 @Inventory @V61 @smoke
  Scenario: Search returns results and Sort By changes order
    Given User opens "https://automationsandbox-v6.clients.dealerspike.net/for-sale--xAllInventory" site in browser
    When I search the inventory for "BMW"
    Then I should see at least one inventory result
    When I sort results by "Price"
    Then the visible results should be sorted by ascending price 
 
  @P1 @Inventory @V6 @smoke
  Scenario: Filter dropdowns show defaults and can be changed
  Given User opens "https://automationsandbox-v6.clients.dealerspike.net/for-sale--xAllInventory" site in browser
    Then the All categories filter should display "All Categories"
    Then the All makes filter should display "All Makes"
    Then the All years filter should display "All Years"
    When I select category "Adventure" from categories filter
    Then the results should be filtered by category "Adventure"
 

  @P1 @Inventory @V7 @smoke
  Scenario: Search returns results and Sort By changes order
  Given User opens "https://ridenow.qa.dsp.leadventure.dev/default.asp?page=xAllInventory&pg=1" site in browser
  When I search the inventory for "Honda"
  Then I should see at least one inventory result
  When I sort results by "Price"
  Then the visible results should be sorted by ascending price

  @P1 @Inventory @V7 @smoke
  Scenario: Filter dropdowns show defaults and can be changed
    Given User opens "https://automationsandbox-v7.clients.dealerspike.net/default.asp?page=xAllInventory&pg=1" site in browser
    Then the All categories filter should display "Vehicle Type"
    Then the All makes filter should display "Make"
  Then the All years filter should display "Year"
  When I select category "Off-Road" from categories filter
  Then the results should be filtered by category "Off-Road"

  @P1 @Inventory1 @V7 @smoke
  Scenario: Filter by Make 
    Given User opens "https://automationsandbox-v7.clients.dealerspike.net/default.asp?page=xAllInventory&pg=1" site in browser 
    When I select make "Yamaha" from makes filter
    And I select year "2025" from years filter
    Then the results should be filtered by make "Yamaha"
    And the results should be filtered by year "2025"
