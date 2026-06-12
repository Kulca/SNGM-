import hre from "hardhat";
import fs from "fs";

async function main() {
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const usdcAddress = deployments.amoy.MockCollateral;

  const [deployer] = await hre.ethers.getSigners();
  const MockCollateral = await hre.ethers.getContractAt("IERC20", usdcAddress);
  
  const balance = await MockCollateral.balanceOf(deployer.address);
  console.log("Mock USDC Balance:", hre.ethers.formatUnits(balance, 6));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
