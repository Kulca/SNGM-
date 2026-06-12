import hre from "hardhat";
import fs from "fs";

async function main() {
    const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    const amoy = deployments.amoy;

    if (!amoy.SangomaGovernanceToken) {
        throw new Error("SangomaGovernanceToken address not found in deployments.json");
    }

    console.log("Deploying SangomaAirdrop and SangomaStaking on Amoy...");

    // 1. Deploy SangomaAirdrop
    // Initial dummy Merkle root
    const dummyMerkleRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const SangomaAirdrop = await hre.ethers.deployContract("SangomaAirdrop", [
        amoy.SangomaGovernanceToken,
        dummyMerkleRoot
    ]);
    await SangomaAirdrop.waitForDeployment();
    const airdropAddress = await SangomaAirdrop.getAddress();
    console.log(`SangomaAirdrop deployed to: ${airdropAddress}`);

    // 2. Deploy SangomaStaking for SNGM
    // Users stake SNGM to earn SNGM (Council Arbiters)
    const SangomaStaking = await hre.ethers.deployContract("SangomaStaking", [
        amoy.SangomaGovernanceToken,
        amoy.SangomaGovernanceToken
    ]);
    await SangomaStaking.waitForDeployment();
    const stakingAddress = await SangomaStaking.getAddress();
    console.log(`SangomaStaking deployed to: ${stakingAddress}`);

    // Update deployments.json
    amoy.SangomaAirdrop = airdropAddress;
    amoy.SangomaStaking = stakingAddress;
    
    fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
    console.log("Updated deployments.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
