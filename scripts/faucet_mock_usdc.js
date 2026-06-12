import hre from "hardhat";
import fs from "fs";

async function main() {
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const usdcAddress = deployments.amoy.MockCollateral;

  const [deployer] = await hre.ethers.getSigners();
  // Try calling 'faucet' instead of 'mint'
  const abi = [
    "function faucet() public",
    "function allocateTo(address to, uint256 amount) public",
    "function balanceOf(address account) public view returns (uint256)"
  ];
  const MockCollateral = await hre.ethers.getContractAt(abi, usdcAddress);
  
  console.log("Trying faucet()...");
  try {
    const tx = await MockCollateral.faucet();
    await tx.wait();
    console.log("Faucet successful.");
  } catch (e) {
    console.log("Faucet failed.");
    console.log("Trying allocateTo()...");
    try {
      const tx2 = await MockCollateral.allocateTo(deployer.address, hre.ethers.parseUnits("1000", 6));
      await tx2.wait();
      console.log("AllocateTo successful.");
    } catch (e2) {
      console.log("AllocateTo failed.");
    }
  }
  
  const balance = await MockCollateral.balanceOf(deployer.address);
  console.log("Mock USDC Balance:", hre.ethers.formatUnits(balance, 6));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
