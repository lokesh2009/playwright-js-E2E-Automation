@Inventory23
Feature: Inventory Filters Validation

Scenario Outline: Validate inventory filters for dealer sites

Given User opens "<site>" site
When User clicks on Inventory page
Then the All categories filter should display "All Categories"
Then the All makes filter should display "All Makes"
Then the All years filter should display "All Years"
When I select category "Adventure" from categories filter
Then the results should be filtered by category "Adventure"

Examples:
| site |
| https://powersports-v7-simple.qa.dsp.leadventure.dev |
| https://powersports-v7-complex.qa.dsp.leadventure.dev |