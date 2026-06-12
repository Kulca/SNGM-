const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Distributing GLP rewards with account:", deployer.address);

    const sngmAddress = "0xed232A0Ec8a80932212b5CaB291665FCec1D592a";
    const vestingAddress = "0xDCEa6108Ecb457D833E6410527A306E9FD3e2ac1";

    const SNGM = await ethers.getContractAt("SangomaGovernanceToken", sngmAddress);
    const Vesting = await ethers.getContractAt("SangomaGLPVesting", vestingAddress);

    const results = JSON.parse(fs.readFileSync("glp_results.json", "utf8"));

    const userMap = {
        "u1": "0x2DF31C3BEC63d410De2877E163Dc32a3d7B8a1Ca",
        "u2": "0x0918acC1B70c0B3ff971336D418a596100bceeB3"
    };

    // Duration: 90 days
    const duration = 90 * 24 * 60 * 60;

    for (const [userId, data] of Object.entries(results)) {
        const address = userMap[userId];
        if (!address) {
            console.warn(`No address found for user ${userId}, skipping.`);
            continue;
        }

        const grant = data.sngm_grant;
        if (grant <= 0) continue;

        const totalAmount = ethers.parseUnits(grant.toString(), 18);
        const liquidAmount = totalAmount / 2n;
        const lockedAmount = totalAmount - liquidAmount;

        console.log(`User ${userId} (${address}): Grant ${grant} SNGM`);
        
        // Liquid part
        console.log(`- Minting ${ethers.formatUnits(liquidAmount, 18)} SNGM (liquid)...`);
        await (await SNGM.mint(address, liquidAmount)).wait();

        // Locked part
        console.log(`- Minting and Locking ${ethers.formatUnits(lockedAmount, 18)} SNGM (vesting)...`);
        // Mint to deployer first so he can lock it (the vesting contract uses transferFrom)
        await (await SNGM.mint(deployer.address, lockedAmount)).wait();
        await (await SNGM.approve(vestingAddress, lockedAmount)).wait();
        await (await Vesting.lock(address, lockedAmount, duration)).wait();
        
        console.log(`- Done for ${userId}`);
    }

    console.log("GLP distribution completed.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
