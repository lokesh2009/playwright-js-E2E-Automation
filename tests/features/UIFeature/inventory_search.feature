Feature: Length filter accuracy for Marine and RV inventory on SRP

  As a user
  I want the length filter to correctly reflect inventory
  So that I can see accurate results for both Marine and RV units

  Background:
    Given the dealer site is configured with "dstMarine" and "dstRV"
    And the user is on the SRP page

  @positive @smoke
  Scenario: Length filter correctly applies to both Marine and RV inventory
    Given Marine units have valid "LOA length" values
    And RV units have valid "length" values
    When the user applies a length filter range "20 to 30"
    Then Marine units with "LOA length" between "20 and 30" should be displayed
    And RV units with "length" between "20 and 30" should be displayed
    And no units outside the selected range should be shown

  @positive @marine @smoke
  Scenario: Marine inventory is filtered using LOA length
    Given a Marine unit exists with stock number "28438"
    And the unit has "LOA length" of "25"
    When the user applies a length filter range "24 to 26"
    Then the Marine unit with stock number "28438" should be displayed

  @positive @rv @smoke
  Scenario: RV inventory is filtered using length field
    Given an RV unit exists with "length" of "28"
    When the user applies a length filter range "27 to 30"
    Then the RV unit should be displayed in the results

  @positive @ui @smoke
  Scenario: Length slider reflects correct inventory range
    Given Marine and RV inventory is available
    When the SRP page is loaded
    Then the length slider minimum value should match the smallest available value
    And the length slider maximum value should match the largest available value

  @positive @regression @smoke
  Scenario: Each vertical uses correct length attribute independently
    Given Marine units use "LOA length"
    And RV units use "length"
    When the user applies a length filter range "20 to 30"
    Then Marine units should be filtered using "LOA length"
    And RV units should be filtered using "length"
    And results should be accurate per vertical