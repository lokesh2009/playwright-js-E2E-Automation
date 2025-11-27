@smoke @ui @dealerspike @parts-request
Feature: Part Request Feature on Dealerspike

    Background:
        Given I navigate to dealerspike parts request page "https://qa-powersports.clients.dealerspike.net/request-parts-dealership--xparts_request"

    @positive @high-priority
    Scenario: User can view part request page with all form elements
        When I verify the part request page is loaded
        Then I should see the part request form
        And I should see all required form fields
        And I should verify the dealership information is displayed

    @positive
    Scenario: User can fill in basic part request information
        When I fill in part request form with following details:
            | field          | value              |
            | partNumber     | ABC-123-XYZ        |
            | partName       | Engine Oil Filter  |
            | quantity       | 5                  |
            | requestNotes   | Urgent delivery    |
        Then I should see the filled part request details
        And I should see the part quantity is "5"

    @positive
    Scenario: User can add multiple parts to a request
        When I add a new part with the following details:
            | partNumber  | ABC-001      |
            | quantity    | 3            |
        And I add a new part with the following details:
            | partNumber  | XYZ-999      |
            | quantity    | 2            |
        Then I should see "2" parts added to the request
        And I should verify the total parts count is "2"

    @positive
    Scenario: User can select dealership location
        When I click on the dealership location dropdown
        Then I should see available dealership locations
        When I select a dealership from the list
        Then I should verify the selected dealership is displayed

    @positive @critical
    Scenario: User can submit a part request
        When I fill in part request form with following details:
            | field          | value              |
            | partNumber     | TEST-001           |
            | partName       | Test Part          |
            | quantity       | 1                  |
        And I click the submit part request button
        Then I should see a success message or confirmation
        And I should verify the request was submitted with reference number

    @negative @validation
    Scenario: User cannot submit empty part request
        When I click the submit part request button without filling form
        Then I should see validation error messages
        And I should see "Part number is required" error
        And I should see "Quantity is required" error

    @negative @validation
    Scenario: User cannot enter invalid quantity
        When I fill in part request form with following details:
            | field          | value              |
            | partNumber     | TEST-002           |
            | quantity       | -5                 |
        Then I should see quantity validation error
        And I should see error message "Quantity must be greater than 0"

    @positive
    Scenario: User can clear part request form
        When I fill in part request form with following details:
            | field          | value              |
            | partNumber     | CLEAR-TEST         |
            | partName       | Clear Test         |
            | quantity       | 10                 |
        And I click the clear form button
        Then I should see an empty part request form
        And I should verify all fields are cleared

    @positive
    Scenario: User can view part request history
        When I click on part request history link
        Then I should see a list of previous requests
        And I should see request timestamps
        And I should see request statuses

    @positive
    Scenario: User can edit an existing part request
        When I navigate to part request history
        And I select the first request from the list
        Then I should see the request details
        When I click the edit request button
        Then I should see the part request form populated with request details
        And I should be able to modify the part details
