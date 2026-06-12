// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IConditionalTokens {
    function reportPayouts(bytes32 questionId, uint[] calldata payouts) external;
}

/**
 * @title SangomaOracle
 * @dev Authorized oracle for resolving prediction markets on Sangoma.
 * Receives resolution signals from the off-chain Matching Engine (SME).
 */
contract SangomaOracle is Ownable {
    IConditionalTokens public immutable ctf;
    
    // Mapping of authorized resolvers (SME, UMA Module, etc.)
    mapping(address => bool) public isAuthorizedResolver;

    event OutcomeReported(bytes32 indexed questionId, uint[] payouts);
    event ResolverStatusUpdated(address indexed resolver, bool status);

    constructor(address _ctf, address _initialSme) Ownable(msg.sender) {
        require(_ctf != address(0), "Invalid CTF address");
        require(_initialSme != address(0), "Invalid SME address");
        ctf = IConditionalTokens(_ctf);
        isAuthorizedResolver[_initialSme] = true;
        isAuthorizedResolver[msg.sender] = true;
    }

    /**
     * @dev Updates the authorized status of a resolver.
     * @param _resolver The resolver address.
     * @param _status The status to set.
     */
    function setResolverStatus(address _resolver, bool _status) external onlyOwner {
        require(_resolver != address(0), "Invalid address");
        isAuthorizedResolver[_resolver] = _status;
        emit ResolverStatusUpdated(_resolver, _status);
    }

    /**
     * @dev Resolves a market by reporting payouts to the Conditional Tokens Framework.
     * @param questionId The unique ID of the market.
     * @param payouts The payout distribution (e.g., [1, 0] for Yes).
     */
    function resolveMarket(bytes32 questionId, uint[] calldata payouts) external {
        require(isAuthorizedResolver[msg.sender], "Not authorized to resolve");
        
        // Call the CTF reportPayouts function
        ctf.reportPayouts(questionId, payouts);
        
        emit OutcomeReported(questionId, payouts);
    }
}
