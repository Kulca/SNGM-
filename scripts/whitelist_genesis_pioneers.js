import hre from "hardhat";
import fs from "fs";

async function main() {
  const networkName = hre.network.name;
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  
  if (!fs.existsSync(deploymentsPath)) {
    console.error("Deployments file not found");
    return;
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const nftAddress = deployments[networkName]?.SangomaGenesisNFT;

  if (!nftAddress) {
    console.error(`SangomaGenesisNFT address not found for network: ${networkName}`);
    return;
  }

  const [deployer] = await hre.ethers.getSigners();
  const nft = await hre.ethers.getContractAt("SangomaGenesisNFT", nftAddress, deployer);

  // Addresses to whitelist (example: u1 and u2 from previous turns)
  const rawAccounts = [
    "0x2DF7607aA4601A9A9A0f882a6132D999905C01Ca", // u1
    "0x091D5E911762F9BfCf9Fb1E58725Bfb0E7582eb3"  // u2
  ];

  const accounts = rawAccounts.map(addr => hre.ethers.getAddress(addr.toLowerCase()));

  console.log(`Whitelisting ${accounts.length} accounts on ${networkName}...`);
  const tx = await nft.setWhitelistBatch(accounts, true);
  await tx.wait();
  console.log(`Batch whitelist complete. Transaction hash: ${tx.hash}`);

  // Verify status
  for (const account of accounts) {
    const isWhitelisted = await nft.isWhitelisted(account);
    console.log(`Account ${account} whitelisted: ${isWhitelisted}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
