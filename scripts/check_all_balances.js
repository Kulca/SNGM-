import hre from "hardhat";

async function main() {
  const wallets = [
    { name: "Deployer", address: "0xfa7410a2e611BcC98aC7C19859606890BDA5146f" },
    { name: "Developer", address: "0x35D39d680244dC6a5dd99141cafc152712d6ce3a" }
  ];

  for (const wallet of wallets) {
    const balance = await hre.ethers.provider.getBalance(wallet.address);
    console.log(`${wallet.name} (${wallet.address}): ${hre.ethers.formatEther(balance)} POL`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
