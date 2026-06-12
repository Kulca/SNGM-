const { ethers } = require("hardhat");
async function main() {
  const FACTORY_ADDRESS = "0x78fCEA353eD97279010ABC8E59f49A32731165EA";
  const NEW_OWNER = "0x35D39d680244dC6a5dd99141cafc152712d6ce3a";
  const factoryAbi = ["function transferOwnership(address newOwner) external"];
  const factory = await ethers.getContractAt(factoryAbi, FACTORY_ADDRESS);
  console.log("Transferring ownership to:", NEW_OWNER);
  const tx = await factory.transferOwnership(NEW_OWNER);
  await tx.wait();
  console.log("Ownership transferred successfully! Hash:", tx.hash);
}
main().catch(console.error);
