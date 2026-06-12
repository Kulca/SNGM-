import hre from "hardhat";
import fs from "fs";

async function main() {
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const sangomaOracleAddress = deployments.amoy.SangomaOracle;

  const sangomaOracle = await hre.ethers.getContractAt("SangomaOracle", sangomaOracleAddress);
  const owner = await sangomaOracle.owner();
  console.log("SangomaOracle owner:", owner);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Current deployer:", deployer.address);
}

main().catch(console.error);
