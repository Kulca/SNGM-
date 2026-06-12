import hre from "hardhat";
import fs from "fs";

async function main() {
    const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
    const amoy = JSON.parse(fs.readFileSync(deploymentsPath, "utf8")).amoy;

    console.log("Verifying SangomaAirdrop...");
    const airdrop = await hre.ethers.getContractAt("SangomaAirdrop", amoy.SangomaAirdrop);
    const airdropToken = await airdrop.token();
    console.log(`- Token address in Airdrop: ${airdropToken}`);
    if (airdropToken.toLowerCase() === amoy.SangomaGovernanceToken.toLowerCase()) {
        console.log("  [SUCCESS] SNGM token matches.");
    } else {
        console.log("  [ERROR] SNGM token mismatch!");
    }

    console.log("\nVerifying SangomaStaking...");
    const staking = await hre.ethers.getContractAt("SangomaStaking", amoy.SangomaStaking);
    const stakingToken = await staking.stakingToken();
    const rewardToken = await staking.rewardToken();
    console.log(`- Staking token: ${stakingToken}`);
    console.log(`- Reward token: ${rewardToken}`);
    if (stakingToken.toLowerCase() === amoy.SangomaGovernanceToken.toLowerCase() &&
        rewardToken.toLowerCase() === amoy.SangomaGovernanceToken.toLowerCase()) {
        console.log("  [SUCCESS] SNGM tokens match.");
    } else {
        console.log("  [ERROR] token mismatch!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
