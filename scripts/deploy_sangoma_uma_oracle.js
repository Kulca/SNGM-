import hre from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying SangomaUMAOracle with the account:", deployer.address);

  const networkName = hre.network.name;
  console.log("Network:", networkName);

  // UMA OO V3 address on Amoy
  const umaOracleAddress = "0xd8866E76441df243fc98B892362Fc6264dC3ca80";
  
  // Load SangomaOracle address from deployments
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
      deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }
  const sangomaOracleAddress = deployments.SangomaOracle;

  if (!sangomaOracleAddress) {
    throw new Error("SangomaOracle address not found in deployments.json");
  }

  // Use deployer as initial council for the trial
  const councilAddress = deployer.address;

  console.log("Deploying SangomaUMAOracle...");
  const SangomaUMAOracle = await hre.ethers.getContractFactory("SangomaUMAOracle");
  const oracle = await SangomaUMAOracle.deploy(umaOracleAddress, sangomaOracleAddress, councilAddress);

  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("SangomaUMAOracle deployed to:", oracleAddress);

  // Authorize SangomaUMAOracle in SangomaOracle
  console.log("Authorizing SangomaUMAOracle in SangomaOracle...");
  const sangomaOracle = await hre.ethers.getContractAt("SangomaOracle", sangomaOracleAddress);
  const tx = await sangomaOracle.setResolverStatus(oracleAddress, true);
  await tx.wait();
  console.log("SangomaUMAOracle authorized.");

  // Update deployments.json
  deployments.SangomaUMAOracle = oracleAddress;
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("Deployments updated.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
