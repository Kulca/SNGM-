const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying SangomaGLPVesting with account:", deployer.address);

    const sngmAddress = "0xed232A0Ec8a80932212b5CaB291665FCec1D592a"; // SNGM address from Phase 5 deployments

    const Vesting = await ethers.getContractFactory("SangomaGLPVesting");
    const vesting = await Vesting.deploy(sngmAddress);
    await vesting.waitForDeployment();

    const address = await vesting.getAddress();
    console.log("SangomaGLPVesting deployed to:", address);

    // Save address
    fs.writeFileSync("vesting_address.txt", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
