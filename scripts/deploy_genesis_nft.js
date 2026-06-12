import hre from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying SangomaGenesisNFT with the account:", deployer.address);

  const networkName = hre.network.name;
  console.log("Network:", networkName);

  // 1. Deploy SangomaGenesisNFT
  console.log("Deploying SangomaGenesisNFT...");
  const GenesisNFT = await hre.ethers.getContractFactory("SangomaGenesisNFT");
  const nft = await GenesisNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("SangomaGenesisNFT deployed to:", nftAddress);

  // 2. Update deployments.json
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
      deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }

  if (!deployments[networkName]) {
    deployments[networkName] = {};
  }

  deployments[networkName].SangomaGenesisNFT = nftAddress;

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("Deployments updated in shared directory.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
