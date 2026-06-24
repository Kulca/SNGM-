# Sangoma Council: UMA Assertion & Dispute Flow

This document outlines the process for the Sangoma Council to resolve markets using the decentralized UMA Optimistic Oracle V3.

## 1. Requesting Resolution

When a market is ready for resolution, a member of the Sangoma Council (or an authorized automated script) calls the `requestResolution` function on the `SangomaUMAOracle` contract.

### Contract Address (Amoy)
`0x3a299F96E0dD8B767Ddc1BC8e3199FF32F203235`

### Function Signature
```solidity
function requestResolution(
    bytes32 marketId,
    string calldata claim,
    address currency,
    uint256 bond
) external returns (bytes32 assertionId)
```

### Parameters
*   **marketId**: The unique identifier of the Sangoma market (matches the `questionId` in CTF).
*   **claim**: A human-readable string that defines the truth being asserted. 
    *   Example: "Did the SARB keep the repo rate unchanged in its July 2026 meeting? YES"
*   **currency**: The address of the ERC-20 token used for the assertion bond (e.g., WETH or USDC).
*   **bond**: The amount of tokens to be locked as a bond. This should be high enough to deter false assertions.

## 2. Assertion Period (Liveness)

Once requested, UMA enters a **Liveness Period** (default: 2 hours). During this time, anyone can dispute the assertion if they believe it is incorrect.

*   If **no dispute** occurs: The assertion is considered "true" after the period expires.
*   If a **dispute** occurs: The assertion is escalated to the UMA DVM (Data Verification Mechanism) for a final vote by UMA token holders.

## 3. Market Settlement

After the assertion is settled (either by expiration or DVM vote), the `assertionResolvedCallback` is triggered.

*   If the assertion is **successful (True)**: The `SangomaUMAOracle` automatically calls `resolveMarket` on the core `SangomaOracle`, distributing payouts to the **YES** outcome.
*   If the assertion is **unsuccessful (False)**: The market remains open. The Council may need to issue a new assertion with corrected parameters or a different outcome.

## 4. Manual Settlement

If the callback fails or is delayed, any user can call `settleAndResolve(bytes32 marketId)` to trigger the final settlement if the UMA liveness period has passed.

## 5. Security & Governance

*   **Council Oversight**: Only the `council` address can initiate assertions through this module.
*   **Decentralized Dispute**: Even though the Council initiates, the UMA network provides a decentralized safety net. If the Council tries to resolve a market incorrectly, UMA participants can dispute it and win the bond.
