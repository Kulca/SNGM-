import hre from "hardhat";
import fs from "fs";

async function main() {
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const sangomaOracleAddress = deployments.amoy.SangomaOracle;
  const umaModuleAddress = deployments.amoy.UMAResolutionModule;

  const sangomaOracle = await hre.ethers.getContractAt("SangomaOracle", sangomaOracleAddress);
  const isAuthorized = await sangomaOracle.isAuthorizedResolver(umaModuleAddress);
  console.log(`Is UMAResolutionModule (${umaModuleAddress}) authorized in SangomaOracle (${sangomaOracleAddress})?`, isAuthorized);
}

main().catch(console.error);
