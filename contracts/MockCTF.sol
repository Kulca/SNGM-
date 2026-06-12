// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockCTF {
    struct Condition {
        address oracle;
        uint outcomeSlotCount;
        bool prepared;
        uint[] payouts;
    }

    mapping(bytes32 => Condition) public conditions;

    function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external {
        conditions[questionId] = Condition(oracle, outcomeSlotCount, true, new uint[](0));
    }

    function reportPayouts(bytes32 questionId, uint[] calldata payouts) external {
        require(conditions[questionId].prepared, "Condition not prepared");
        require(msg.sender == conditions[questionId].oracle, "Only oracle can report");
        conditions[questionId].payouts = payouts;
    }
    
    function getPayouts(bytes32 questionId) external view returns (uint[] memory) {
        return conditions[questionId].payouts;
    }
}
