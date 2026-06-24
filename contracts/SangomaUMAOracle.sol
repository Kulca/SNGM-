// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./UMAInterfaces.sol";

interface ISangomaOracle {
    function resolveMarket(bytes32 questionId, uint[] calldata payouts) external;
}

/**
 * @title SangomaUMAOracle
 * @dev Specialized UMA Optimistic Oracle wrapper for the Sangoma Prediction Market Phase 6.
 * It allows the Sangoma Council to request assertions for market outcomes.
 */
contract SangomaUMAOracle is Ownable {
    IOptimisticOracleV3 public immutable umaOracle;
    ISangomaOracle public immutable sangomaOracle;

    // The address representing the Sangoma Council (can be a multisig or DAO)
    address public council;

    // Default liveness period for assertions (e.g., 2 hours)
    uint64 public defaultLiveness = 7200;

    // Mapping from UMA assertionId to Sangoma questionId (marketId)
    mapping(bytes32 => bytes32) public assertionToMarket;
    // Mapping from marketId to UMA assertionId
    mapping(bytes32 => bytes32) public marketToAssertion;

    event CouncilUpdated(address indexed oldCouncil, address indexed newCouncil);
    event MarketAssertionRequested(bytes32 indexed marketId, bytes32 indexed assertionId, string claim);
    event MarketResolved(bytes32 indexed marketId, bytes32 indexed assertionId, bool outcome);

    modifier onlyCouncil() {
        require(msg.sender == council || msg.sender == owner(), "Not authorized: Council only");
        _;
    }

    constructor(address _umaOracle, address _sangomaOracle, address _council) Ownable(msg.sender) {
        umaOracle = IOptimisticOracleV3(_umaOracle);
        sangomaOracle = ISangomaOracle(_sangomaOracle);
        council = _council;
    }

    function setCouncil(address _newCouncil) external onlyOwner {
        require(_newCouncil != address(0), "Invalid council address");
        emit CouncilUpdated(council, _newCouncil);
        council = _newCouncil;
    }

    function setDefaultLiveness(uint64 _liveness) external onlyOwner {
        defaultLiveness = _liveness;
    }

    /**
     * @dev Requests a resolution assertion from UMA for a specific market.
     * @param marketId The unique ID of the Sangoma market.
     * @param claim The human-readable claim for UMA to verify.
     * @param currency The token used for the assertion bond.
     * @param bond The amount of bond tokens.
     */
    function requestResolution(
        bytes32 marketId,
        string calldata claim,
        address currency,
        uint256 bond
    ) external onlyCouncil returns (bytes32 assertionId) {
        require(marketToAssertion[marketId] == bytes32(0), "Assertion already exists for market");

        // Transfer bond from caller to this contract
        IERC20(currency).transferFrom(msg.sender, address(this), bond);
        // Approve UMA Oracle to spend bond
        IERC20(currency).approve(address(umaOracle), bond);

        assertionId = umaOracle.assertTruth(
            bytes(claim),
            address(this), // asserter is this contract
            address(this), // callbackRecipient
            address(0),    // escalationManager
            defaultLiveness,
            currency,
            bond,
            keccak256("ASSERT_TRUTH"),
            bytes32(0)
        );

        assertionToMarket[assertionId] = marketId;
        marketToAssertion[marketId] = assertionId;

        emit MarketAssertionRequested(marketId, assertionId, claim);
    }

    /**
     * @dev Callback from UMA OO V3 when an assertion is resolved.
     */
    function assertionResolvedCallback(bytes32 assertionId, bool assertedTruth) external {
        require(msg.sender == address(umaOracle), "Only UMA Oracle can call");
        
        bytes32 marketId = assertionToMarket[assertionId];
        require(marketId != bytes32(0), "Unknown assertion");

        if (assertedTruth) {
            // Assertion was successful, resolve market to YES
            uint[] memory payouts = new uint[](2);
            payouts[0] = 1; // YES
            payouts[1] = 0; // NO
            sangomaOracle.resolveMarket(marketId, payouts);
        } else {
            // Assertion failed. In a more complex setup, we might wait for another assertion
            // or trigger a manual council override.
        }

        emit MarketResolved(marketId, assertionId, assertedTruth);
    }

    /**
     * @dev Manual trigger to settle and resolve if callback didn't fire or for testing.
     */
    function settleAndResolve(bytes32 marketId) external {
        bytes32 assertionId = marketToAssertion[marketId];
        require(assertionId != bytes32(0), "No assertion for market");

        umaOracle.settleAndGetAssertionResult(assertionId);
        
        IOptimisticOracleV3.Assertion memory assertion = umaOracle.getAssertion(assertionId);
        require(assertion.settled, "Assertion not settled");

        if (assertion.settlementSuccessful) {
            uint[] memory payouts = new uint[](2);
            payouts[0] = 1; // YES
            payouts[1] = 0; // NO
            sangomaOracle.resolveMarket(marketId, payouts);
            emit MarketResolved(marketId, assertionId, true);
        }
    }
}
