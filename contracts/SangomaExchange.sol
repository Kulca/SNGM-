// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IConditionalTokens {
    function splitPosition(
        IERC20 collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint[] calldata partition,
        uint amount
    ) external;
}

/**
 * @title SangomaExchange
 * @dev Handles on-chain settlement of matched trades from the SME.
 * Verifies EIP-712 signatures from users and interacts with the CTF.
 */
contract SangomaExchange is EIP712, Ownable {
    using ECDSA for bytes32;

    IConditionalTokens public immutable ctf;
    IERC20 public immutable collateralToken;

    bytes32 public constant ORDER_TYPEHASH = keccak256(
        "Order(address maker,address token,uint256 price,uint256 amount,uint8 side,bytes32 salt,uint256 expiration)"
    );

    struct Order {
        address maker;
        address token;
        uint256 price;
        uint256 amount;
        uint8 side; // 0 for Buy, 1 for Sell
        bytes32 salt;
        uint256 expiration;
    }

    event TradeExecuted(
        address indexed buyer,
        address indexed seller,
        bytes32 indexed conditionId,
        uint256 price,
        uint256 amount
    );

    constructor(
        address _ctf,
        address _collateralToken,
        string memory name,
        string memory version
    ) EIP712(name, version) Ownable(msg.sender) {
        ctf = IConditionalTokens(_ctf);
        collateralToken = IERC20(_collateralToken);
    }

    /**
     * @dev Executes a matched trade between a buyer and a seller.
     * @param buyerOrder The order details for the buyer.
     * @param buyerSignature The signature from the buyer.
     * @param sellerOrder The order details for the seller.
     * @param sellerSignature The signature from the seller.
     * @param conditionId The CTF condition ID for the market.
     */
    function executeTrade(
        Order calldata buyerOrder,
        bytes calldata buyerSignature,
        Order calldata sellerOrder,
        bytes calldata sellerSignature,
        bytes32 conditionId
    ) external {
        require(block.timestamp <= buyerOrder.expiration, "Buyer order expired");
        require(block.timestamp <= sellerOrder.expiration, "Seller order expired");
        require(buyerOrder.price >= sellerOrder.price, "Price mismatch");
        require(buyerOrder.amount == sellerOrder.amount, "Amount mismatch");

        // Verify signatures
        verifySignature(buyerOrder, buyerSignature);
        verifySignature(sellerOrder, sellerSignature);

        // Settlement Logic:
        // 1. Transfer collateral from buyer to this contract
        // 2. Transfer collateral from seller to this contract (or use existing tokens)
        // 3. Call CTF.splitPosition to mint outcome tokens
        // 4. Distribute tokens to buyer and seller
        
        // Simplified for Phase 3 draft:
        // In a real implementation, this would handle the complex logic of 
        // converting collateral to 'Yes'/'No' tokens via CTF.
        
        emit TradeExecuted(
            buyerOrder.maker,
            sellerOrder.maker,
            conditionId,
            sellerOrder.price,
            buyerOrder.amount
        );
    }

    function verifySignature(Order calldata order, bytes calldata signature) public view {
        bytes32 structHash = keccak256(abi.encode(
            ORDER_TYPEHASH,
            order.maker,
            order.token,
            order.price,
            order.amount,
            order.side,
            order.salt,
            order.expiration
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        
        address signer;
        if (order.maker.code.length > 0) {
            // EIP-1271 for Smart Accounts (Safe)
            // require(IERC1271(order.maker).isValidSignature(hash, signature) == 0x1626ba7e, "Invalid Safe signature");
            signer = order.maker; // Placeholder for EIP-1271 check
        } else {
            signer = hash.recover(signature);
        }
        
        require(signer == order.maker, "Invalid signature");
    }
}
