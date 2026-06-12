const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { ethers } = require('ethers');
const fs = require('fs');

// 1. Phase 4 Participants and Calculated Rewards
// Logic: Base (5M) + Volume (15M) = 20M SNGM per user
const participants = [
    { address: "0x2DF31C3BEC63d410De2877E163Dc32a3d7B8a1Ca", amount: ethers.parseUnits("20000000", 18) },
    { address: "0x0918acC1B70c0B3ff971336D418a596100bceeB3", amount: ethers.parseUnits("20000000", 18) }
];

// 2. Hash leaves: keccak256(abi.encode(address, amount))
function hashParticipant(address, amount) {
    return Buffer.from(
        ethers.solidityPackedKeccak256(
            ["address", "uint256"],
            [address, amount]
        ).slice(2),
        "hex"
    );
}

const leaves = participants.map(p => hashParticipant(p.address, p.amount));

// 3. Create Merkle Tree
const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const root = tree.getHexRoot();

const distributionData = {
    root: root,
    participants: participants.map((p, index) => ({
        address: p.address,
        amount: p.amount.toString(),
        proof: tree.getHexProof(leaves[index])
    }))
};

fs.writeFileSync("/home/team/shared/sngm_airdrop_distribution.json", JSON.stringify(distributionData, null, 2));

console.log("Merkle Root:", root);
console.log("Distribution data saved to /home/team/shared/sngm_airdrop_distribution.json");
