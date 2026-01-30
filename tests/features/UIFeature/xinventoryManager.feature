
@V6
Feature: Inventory Management

      Test Case: Inventory Manager | Select Existing Inventory | Filter By
      Test Case: Inventory Manager | Unit Marketing Option | Featured Unit
      Test Case: Inventory Manager | Vehicle Categorization | Select Existing Inventory
      Test Case: Inventory Manager | Monthly Payment Information | Fields
      Test Case: Inventory Manager | Monthly Payment Information | Cancel/Reset
      Test Case: Inventory Manager | Pricing Information | MSRP Field for new unit

      Background:
        Given I navigate dealerspike parts request page "https://automationsandbox-v7.clients.dealerspike.net"
        When I log in with valid admin credentials
        
      @Regression @P1 @InventoryManagement
      Scenario: 436034 Inventory Manager | Select Existing Inventory | Filter By

     When User clicks on Inventory menu on home page
     Then Inventory navigation bar should be displayed
     When User clicks Inventory Manager on Inventory Navigation bar
     Then User should see Inventory Management page in dealerspike admin
     And Show Options button should be displayed on Inventory Management page

     When User clicks on Show Options button on Inventory Management page
     Then Filter option New should be displayed on Inventory Management page
     And Filter option Used should be displayed on Inventory Management page
     And Filter option Rental should be displayed on Inventory Management page
     And Filter option Only Active should be displayed on Inventory Management page
     And Filter option Featured should be displayed on Inventory Management page
     And Filter option Clearance should be displayed on Inventory Management page
     And Filter option In Feed should be displayed on Inventory Management page

     When User selects 2006 Arctic Cat® 2455 Alterra 600 EPS from Inventory Dropdown on Inventory Management page
     Then Vehicle Type Cargo Trailer should be selected on Inventory Management page
     And Year 2006 should be selected on Inventory Management page
     And Manufacturer Arctic Cat® should be selected on Inventory Management page
     And Model Alterra 600 EPS should be selected on Inventory Management page
     And Category Bumper Pull should be selected on Inventory Management page
     When User unchecks filter option New on Inventory Management page
     Then Vehicle Type Cargo Trailer should be selected on Inventory Management page
     And Year 2006 should be selected on Inventory Management page
     And Manufacturer empty should be selected on Inventory Management page
     And Model empty should be selected on Inventory Management page
     And Category empty should be selected on Inventory Management page

     When User clicks on Show Options button on Inventory Management page
     Then Filter options should collapse on Inventory Management page

     And Types filter should display All Types on Inventory Management page
     And Years filter should display All Years on Inventory Management page
     And Makes filter should display All Makes on Inventory Management page

     When User selects Cargo Trailer from Types filter on Inventory Management page
     Then Option No Vehicles should be present in Inventory Dropdown on Inventory Management page

  
