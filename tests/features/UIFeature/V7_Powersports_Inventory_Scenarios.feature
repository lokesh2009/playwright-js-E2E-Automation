
@inventory @harley @powersports @smoke @Goldenset
Feature: V7 Powersports New Harley-Davidson Inventory Page
 
  @smoke @page-load
  Scenario: Inventory page loads successfully with correct title and meta
    Then the page title should contain "new-for-sale--xNewInventory"
    And the page should return HTTP status 200
    And the canonical URL should match the expected inventory URL
    And the meta description should not be empty

  @smoke @page-load
  Scenario: Core inventory page sections are visible on load
    Then the page header should be displayed
    And the inventory results section should be displayed
    And the filter/facet panel should be displayed
    And the sort dropdown should be displayed
    And the results count label should be displayed
    And the pagination component should be displayed
    And the page footer should be displayed

  @smoke @page-load
  Scenario: Inventory page displays the correct condition pre-selected
    Then the "New" condition filter should be pre-selected
    And the results count should reflect new inventory only

  @smoke @page-load
  Scenario: Inventory page hero or breadcrumb displays correct dealer context
    Then the breadcrumb trail should contain "Harley-Davidson"
    And the breadcrumb trail should contain "New Motorcycles"

 

  @smoke @listing-cards
  Scenario: Inventory listings are displayed on page load
    Then at least one inventory vehicle card should be visible
    And each vehicle card should display a vehicle image
    And each vehicle card should display the vehicle year, make and model
    And each vehicle card should display the MSRP or price

  @regression @listing-cards
  Scenario: Vehicle card displays all required information elements
    When the user views the first vehicle card in the listing
    Then the card should display the vehicle image
    And the card should display the vehicle year
    And the card should display the make as "Harley-Davidson"
    And the card should display the model name
    And the card should display the stock number or VIN
    And the card should display the price or "Call for Price" label
    And the card should display a primary CTA button

  @regression @listing-cards
  Scenario: Vehicle card primary CTA navigates to Vehicle Detail Page
    When the user clicks the primary CTA on the first vehicle card
    Then the user should be redirected to the Vehicle Detail Page
    And the VDP URL should contain the vehicle's stock number or identifier
    And the VDP should display the same vehicle make and model as the card

  @regression @listing-cards
  Scenario: Vehicle card image is clickable and navigates to VDP
    When the user clicks the vehicle image on the first vehicle card
    Then the user should be redirected to the corresponding Vehicle Detail Page

  @regression @listing-cards
  Scenario: Vehicle card title link is clickable and navigates to VDP
    When the user clicks the vehicle title/name on the first vehicle card
    Then the user should be redirected to the corresponding Vehicle Detail Page

  @regression @listing-cards
  Scenario: No broken images appear on vehicle cards
    Then no vehicle card image should return a 404 status
    And no image placeholder icon should be visible in place of a vehicle photo

  @smoke @filter @condition
  Scenario: New condition filter is active by default from URL parameter
    Then the "condition=new" parameter should be present in the URL
    And the "New" filter chip or checkbox should appear selected
    And the inventory results should contain only new vehicles

  @regression @filter @condition
  Scenario: User can switch condition filter to Used
    When the user selects the "Used" condition filter
    Then the URL should update to include "condition=used"
    And the results should refresh to show used vehicles
    And the results count should update accordingly

  @regression @filter @condition
  Scenario: Clearing the condition filter returns all inventory
    When the user removes the active "New" condition filter
    Then the condition parameter should be removed or set to "all" in the URL
    And the results count should be greater than or equal to the new-only count


  @smoke @filter @make
  Scenario: Harley-Davidson make is pre-applied from the inventory page context
    Then "Harley-Davidson" should appear as the active make filter
    And all displayed vehicles should have the make "Harley-Davidson"

  @regression @filter @model
  Scenario: User can filter inventory by a specific model
    When the user selects a model from the Model filter facet
    Then the URL should update to include the selected model parameter
    And all displayed vehicle cards should match the selected model
    And the results count should decrease or remain the same

  @regression @filter @category
  Scenario: User can filter inventory by motorcycle category
    When the user selects a category such as "Touring" from the Category filter
    Then the results should only display vehicles in the "Touring" category
    And the active filter chip for "Touring" should be visible

  @regression @filter @model
  Scenario: Model filter dropdown shows only models relevant to Harley-Davidson
    When the user opens the Model filter panel
    Then the model list should contain Harley-Davidson model names only
    And the model list should not contain models from other manufacturers

  @regression @filter @price @smoke
  Scenario: User can set a minimum price filter
    When the user sets the minimum price filter to "10000"
    Then the URL should update with the minimum price parameter
    And all displayed vehicles should have a price of at least $10,000

  @regression @filter @price @smoke
  Scenario: User can set a maximum price filter
    When the user sets the maximum price filter to "30000"
    Then the URL should update with the maximum price parameter
    And all displayed vehicles should have a price of at most $30,000

  @regression @filter @price @smoke
  Scenario: User can set a price range using both min and max filters
    When the user sets the minimum price filter to "15000"
    And the user sets the maximum price filter to "25000"
    Then all displayed vehicles should have a price between $15,000 and $25,000

  @regression @filter @price @smoke
  Scenario: Entering an invalid price range shows a validation message
    When the user sets the minimum price filter to "50000"
    And the user sets the maximum price filter to "10000"
    Then a validation error or empty results message should be displayed


  @regression @filter @year @smoke
  Scenario: User can filter inventory by a specific year
    When the user selects a year from the Year filter facet
    Then the URL should update with the selected year parameter
    And all displayed vehicle cards should show the selected year

  @regression @filter @year @smoke
  Scenario: User can filter by a year range using min and max year selectors
    When the user sets the minimum year to "2022"
    And the user sets the maximum year to "2024"
    Then all displayed vehicles should have a model year between 2022 and 2024


  @regression @filter @color @smoke
  Scenario: User can filter inventory by exterior color
    When the user selects a color option from the Color filter facet
    Then the results should update to show only vehicles matching the selected color
    And the active filter chip for the selected color should be visible

  @regression @filter @engine @smoke
  Scenario: User can filter inventory by engine displacement or type
    When the user selects an engine size or type from the Engine filter
    Then the results should reflect only vehicles matching the engine specification


  @regression @filter @chips @smoke
  Scenario: Active filters are displayed as removable chips
    When the user applies a model filter
    Then an active filter chip for the selected model should appear
    And the chip should display the filter name and value
    And a remove (×) button should be visible on the chip

  @regression @filter @chips @smoke
  Scenario: User can remove an individual active filter chip
    Given the user has applied a model filter
    When the user clicks the remove button on the model filter chip
    Then the model filter should be deselected
    And the URL should no longer contain the model parameter
    And the results should refresh to the broader filtered set

  @regression @filter @chips @smoke
  Scenario: "Clear All Filters" removes all active filters
    Given the user has applied multiple filters including model and price range
    When the user clicks the "Clear All Filters" or "Reset" button
    Then all active filter chips should be removed
    And the URL should revert to the base inventory URL with only the condition parameter
    And the results count should return to the full new inventory count


  @smoke @sort @smoke
  Scenario: Default sort order is Make ascending as set by URL parameter
    Then the sort dropdown should display "Make: A to Z" or equivalent ascending option
    And the URL should contain "sortby=Make|asc"
    And the first vehicle in the listing should reflect the earliest alphabetical make value

  @regression @sort @smoke
  Scenario: User can sort inventory by Price – Low to High
    When the user selects "Price: Low to High" from the sort dropdown
    Then the URL should update with the price ascending sort parameter
    And the first vehicle card should display the lowest price in the results set
    And vehicle prices should be in ascending order across visible cards

  @regression @sort @smoke
  Scenario: User can sort inventory by Price – High to Low
    When the user selects "Price: High to Low" from the sort dropdown
    Then the URL should update with the price descending sort parameter
    And the first vehicle card should display the highest price in the results set

  @regression @sort @smoke
  Scenario: User can sort inventory by Year – Newest First
    When the user selects "Year: Newest First" from the sort dropdown
    Then the URL should update with the year descending sort parameter
    And the vehicle years should be displayed in descending order across visible cards

  @regression @sort @smoke
  Scenario: User can sort inventory by Year – Oldest First
    When the user selects "Year: Oldest First" from the sort dropdown
    Then the vehicle years should be displayed in ascending order across visible cards

  @regression @sort @smoke
  Scenario: User can sort inventory by Make A to Z
    When the user selects "Make: A to Z" from the sort dropdown
    Then the URL should contain "sortby=Make|asc"
    And vehicle makes should appear in ascending alphabetical order

  @regression @sort @smoke
  Scenario: User can sort inventory by Make Z to A
    When the user selects "Make: Z to A" from the sort dropdown
    Then the URL should contain "sortby=Make|desc"
    And vehicle makes should appear in descending alphabetical order



  @smoke @pagination @smoke
  Scenario: Pagination is displayed when results exceed one page
    Given the inventory has more results than the default page size
    Then the pagination component should be visible
    And the current page should be highlighted as page "1"
    And a "Next" or forward navigation control should be available

  @regression @pagination @smoke
  Scenario: User can navigate to the next page of results
    Given the inventory has more than one page of results
    When the user clicks the "Next" pagination button
    Then the URL should update to "pg=2"
    And a new set of vehicle cards should be displayed
    And the current page indicator should show page "2"
    And the "Previous" pagination button should become active


  @regression @pagination @smoke
  Scenario: User can navigate back to the previous page
    Given the user is on page 2 of the inventory results
    When the user clicks the "Previous" pagination button
    Then the URL should update to "pg=1"
    And the page "1" indicator should be highlighted as active

  @regression @pagination @smoke
  Scenario: "Previous" button is disabled or hidden on the first page
    Given the user is on page 1 of the inventory results
    Then the "Previous" pagination button should be disabled or not rendered

  @regression @pagination @smoke
  Scenario: "Next" button is disabled or hidden on the last page
    Given the user is on the last page of the inventory results
    Then the "Next" pagination button should be disabled or not rendered

  @regression @pagination @smoke
  Scenario: Pagination resets to page 1 when a new filter is applied
    Given the user is on page 2 of the inventory results
    When the user applies a new model filter
    Then the URL should update to "pg=1"
    And the results should display from the first page

  @regression @pagination @smoke
  Scenario: Results per page selector updates the number of visible cards
    When the user changes the results-per-page setting to "24"
    Then up to 24 vehicle cards should be visible on the page
    And the pagination total should adjust accordingly
