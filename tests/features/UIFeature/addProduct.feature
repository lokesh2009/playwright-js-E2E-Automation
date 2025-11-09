
@smoke @ui
Feature: Adding Product in Catlog and check the price
    Scenario: Add a product to the catalog and verify its price
        Given I am on the "Home page" page
        And I click on "Search Page" in seach textbox
        Then I enter the "Add Product" in the search box
        And I click on Search button
        When I scroll to the "Add Product" button
        And I click on "Add Product" description
         
