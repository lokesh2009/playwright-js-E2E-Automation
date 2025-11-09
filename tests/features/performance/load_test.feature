Feature: Amazon Load Test

  Scenario: Run JMeter load test for Amazon search
    Given I execute JMeter test "amazon_search_test.jmx"
    Then I should see average response time under 2s
