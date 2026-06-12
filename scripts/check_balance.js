import hre from "hardhat";

async function main() {
  const address = "0xfa7410a2e611BcC98aC7C19859606890BDA5146f";
  const balance = await hre.ethers.provider.getBalance(address);
  console.log(`Balance of ${address}: ${hre.ethers.formatEther(balance)} POL`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
