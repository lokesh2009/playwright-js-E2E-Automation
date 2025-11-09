
@smoke @api
Feature: API Testing for Product Service

  Background:
    Given the API base URL is "https://fakestoreapi.com"

  Scenario: Get all products
    When I send a GET request to "/products"
    Then the response status should be 200
    And the response should contain a list of products

  Scenario: Create a new product
    When I send a POST request to "/products" with body:
      """
      {
        "title": "QA Automation Book",
        "price": 109.95,
        "description": "A guide to Playwright + API testing",
        "category": "books"
      }
      """
    Then the response status should be 200
    And the response should contain the title "QA Automation Book"
