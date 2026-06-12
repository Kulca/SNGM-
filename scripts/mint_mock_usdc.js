import hre from "hardhat";
import fs from "fs";

async function main() {
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const usdcAddress = deployments.amoy.MockCollateral;

  const [deployer] = await hre.ethers.getSigners();
  // Using a generic mint function if it exists
  const abi = [
    "function mint(address to, uint256 amount) public",
    "function balanceOf(address account) public view returns (uint256)"
  ];
  const MockCollateral = await hre.ethers.getContractAt(abi, usdcAddress);
  
  console.log("Minting 1000 Mock USDC...");
  const tx = await MockCollateral.mint(deployer.address, hre.ethers.parseUnits("1000", 6));
  await tx.wait();
  
  const balance = await MockCollateral.balanceOf(deployer.address);
  console.log("Mock USDC Balance:", hre.ethers.formatUnits(balance, 6));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
