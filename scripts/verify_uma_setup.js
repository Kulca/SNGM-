import hre from "hardhat";
import fs from "fs";

async function main() {
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  
  const oracleAddress = deployments.SangomaUMAOracle;
  const sangomaOracleAddress = deployments.SangomaOracle;

  console.log("Verifying SangomaUMAOracle at:", oracleAddress);
  const SangomaUMAOracle = await hre.ethers.getContractAt("SangomaUMAOracle", oracleAddress);
  
  const council = await SangomaUMAOracle.council();
  console.log("Council address:", council);

  const umaOracle = await SangomaUMAOracle.umaOracle();
  console.log("UMA Oracle address:", umaOracle);

  console.log("Verifying authorization in SangomaOracle...");
  const SangomaOracle = await hre.ethers.getContractAt("SangomaOracle", sangomaOracleAddress);
  const isAuthorized = await SangomaOracle.isAuthorizedResolver(oracleAddress);
  console.log("Is SangomaUMAOracle authorized?", isAuthorized);

  if (isAuthorized) {
    console.log("Verification SUCCESSFUL.");
  } else {
    console.error("Verification FAILED: Not authorized.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
