
@lighthouse @smoke
Feature: Run Lighthouse audit

  Scenario: Audit homepage performance
    Given I run Lighthouse on "https://www.sargentsequipmentwi.com/"
    Then I should get a performance score above 90
