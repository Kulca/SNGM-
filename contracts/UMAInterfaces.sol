// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IOptimisticOracleV3
 * @dev Partial interface for UMA's Optimistic Oracle V3.
 */
interface IOptimisticOracleV3 {
    function assertTruth(
        bytes calldata claim,
        address asserter,
        address callbackRecipient,
        address escalationManager,
        uint64 liveness,
        address currency,
        uint256 bond,
        bytes32 identifier,
        bytes32 domainId
    ) external returns (bytes32 assertionId);

    function settleAndGetAssertionResult(bytes32 assertionId) external returns (bool);

    struct Assertion {
        address asserter;
        address callbackRecipient;
        address escalationManager;
        address caller;
        uint64 expirationTime;
        address currency;
        uint256 bond;
        bytes32 identifier;
        bytes32 domainId;
        bool settled;
        bool settlementSuccessful;
    }

    function getAssertion(bytes32 assertionId) external view returns (Assertion memory);
}
