
@smoke @ui
Feature: Adding Product in Catlog and check the price
    
    Scenario: Add a product to the Amazon catalog and verify its price
        Given I am on the "Home page" page
        And I click on "Search Page" in seach textbox
        Then I enter the "Add Product" in the search box
        And I click on Search button
        When I scroll to the "Add Product" button
        And I click on "Add Product" description

    @dealerspike @smoke
    Scenario: Add a product to dealerspike catalog and verify price
        Given I navigate to dealerspike "https://qa-powersports.clients.dealerspike.net/"
        When I search for a product in dealerspike
        Then I should see product results
        And I should verify product pricing on dealerspike
