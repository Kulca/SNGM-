// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SangomaGenesisNFT
 * @dev Soulbound NFT for Genesis Traders in the Sangoma Phase 6 Sandbox.
 * Non-transferable after minting. Limited to 1,000 units.
 */
contract SangomaGenesisNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    mapping(address => bool) public isWhitelisted;

    event Whitelisted(address indexed account, bool status);

    constructor() ERC721("Sangoma Genesis Pioneer", "SGP") Ownable(msg.sender) {}

    /**
     * @dev Updates the whitelist status for an account.
     */
    function setWhitelist(address account, bool status) external onlyOwner {
        isWhitelisted[account] = status;
        emit Whitelisted(account, status);
    }

    /**
     * @dev Batch updates the whitelist status for multiple accounts.
     */
    function setWhitelistBatch(address[] calldata accounts, bool status) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            isWhitelisted[accounts[i]] = status;
            emit Whitelisted(accounts[i], status);
        }
    }

    /**
     * @dev Mints a Genesis NFT to the sender if they are whitelisted.
     * Each address can only own one SGP.
     */
    function mint(string memory tokenURI) external {
        require(isWhitelisted[msg.sender], "Not whitelisted");
        require(balanceOf(msg.sender) == 0, "Already has a Genesis NFT");
        require(_nextTokenId < 1000, "Max supply reached");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    /**
     * @dev Soulbound logic: Overrides transfer behavior to prevent movement between accounts.
     * Only allows minting (from address(0)) and burning (to address(0)).
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Returns the total number of NFTs minted so far.
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
