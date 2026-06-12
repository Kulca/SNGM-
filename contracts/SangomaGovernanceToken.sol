// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SangomaGovernanceToken (SNGM)
 * @dev The SNGM token is an ERC-20 token that powers the Sangoma Governance system.
 * It includes a slashing mechanism for Council Arbiters who participate in incorrect resolutions.
 */
contract SangomaGovernanceToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant SLASHER_ROLE = keccak256("SLASHER_ROLE");

    event ArbiterSlashed(address indexed arbiter, uint256 amount, string reason);

    constructor() ERC20("Sangoma Governance Token", "SNGM") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(SLASHER_ROLE, msg.sender);
    }

    /**
     * @dev Slashes a specified amount of tokens from an arbiter's balance.
     * Only callable by the authorized SlashingAuthority (Governance Council).
     * @param arbiter The address of the arbiter to be slashed.
     * @param amount The amount of SNGM tokens to slash.
     * @param reason The reason for the slashing event.
     */
    function slash(address arbiter, uint256 amount, string calldata reason) external onlyRole(SLASHER_ROLE) {
        _burn(arbiter, amount);
        emit ArbiterSlashed(arbiter, amount, reason);
    }

    /**
     * @dev Mints new SNGM tokens. Typically used for liquidity rewards or arbiter incentives.
     * Only callable by the authorized Treasury or RewardController.
     * @param to The address receiving the tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
