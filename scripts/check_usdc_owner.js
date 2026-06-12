import hre from "hardhat";
import fs from "fs";

async function main() {
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const usdcAddress = deployments.amoy.MockCollateral;

  const [deployer] = await hre.ethers.getSigners();
  const abi = [
    "function owner() public view returns (address)"
  ];
  const MockCollateral = await hre.ethers.getContractAt(abi, usdcAddress);
  
  try {
    const owner = await MockCollateral.owner();
    console.log("Mock USDC Owner:", owner);
  } catch (e) {
    console.log("Mock USDC does not have an owner() function or it failed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
