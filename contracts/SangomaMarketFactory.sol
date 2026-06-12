// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IConditionalTokens {
    function prepareCondition(address oracle, bytes32 questionId, uint outcomeSlotCount) external;
}

/**
 * @title SangomaMarketFactory
 * @dev Factory contract to simplify the creation of prediction markets on Sangoma.
 * Wraps the Conditional Tokens Framework (CTF) functionality.
 */
contract SangomaMarketFactory is Ownable {
    IConditionalTokens public immutable ctf;
    
    // The authorized Sangoma Oracle that will resolve markets created by this factory
    address public sangomaOracle;

    event MarketCreated(bytes32 indexed questionId, uint outcomeSlotCount, address oracle);
    event OracleUpdated(address indexed newOracle);

    constructor(address _ctf, address _sangomaOracle) Ownable(msg.sender) {
        require(_ctf != address(0), "Invalid CTF address");
        require(_sangomaOracle != address(0), "Invalid Oracle address");
        ctf = IConditionalTokens(_ctf);
        sangomaOracle = _sangomaOracle;
    }

    /**
     * @dev Updates the default oracle for new markets.
     * @param _oracle The new oracle address.
     */
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid Oracle address");
        sangomaOracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    /**
     * @dev Creates a new prediction market condition on the CTF.
     * @param questionId The unique ID of the question (often a hash of metadata).
     * @param outcomeSlotCount The number of possible outcomes (e.g., 2 for Yes/No).
     */
    function createMarket(bytes32 questionId, uint outcomeSlotCount) external onlyOwner {
        require(outcomeSlotCount >= 2, "Market must have at least 2 outcomes");
        
        // Register the condition with the CTF
        ctf.prepareCondition(sangomaOracle, questionId, outcomeSlotCount);
        
        emit MarketCreated(questionId, outcomeSlotCount, sangomaOracle);
    }
}
