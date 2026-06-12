import hre from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const networkName = hre.network.name;
  console.log("Network:", networkName);

  if (networkName === "hardhat") {
      console.warn("Deploying to local hardhat network. Addresses will not be persisted correctly in shared deployments.json for others.");
  }

  // Load existing deployments
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
      deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }

  if (!deployments[networkName] && networkName !== "hardhat") {
    console.warn(`No deployments found for network: ${networkName}. Initializing...`);
    const network = await deployer.provider.getNetwork();
    deployments[networkName] = { chainId: Number(network.chainId) };
  }

  const sangomaOracleAddress = deployments[networkName] ? deployments[networkName].SangomaOracle : null;
  // UMA OO V3 address from researcher's findings on Amoy
  const umaOracleAddress = networkName === "amoy" ? "0xd8866E76441df243fc98B892362Fc6264dC3ca80" : "0x0000000000000000000000000000000000000000";

  if (!sangomaOracleAddress && networkName !== "hardhat") {
      throw new Error("SangomaOracle address not found in deployments.json");
  }

  // 1. Deploy SangomaGovernanceToken (SNGM)
  console.log("Deploying SangomaGovernanceToken...");
  const SNGM = await hre.ethers.getContractFactory("SangomaGovernanceToken");
  const sngm = await SNGM.deploy();
  await sngm.waitForDeployment();
  const sngmAddress = await sngm.getAddress();
  console.log("SangomaGovernanceToken deployed to:", sngmAddress);

  let umaModuleAddress = "0x0000000000000000000000000000000000000000";
  if (sangomaOracleAddress) {
      // 2. Deploy UMAResolutionModule
      console.log("Deploying UMAResolutionModule...");
      const UMAResolutionModule = await hre.ethers.getContractFactory("UMAResolutionModule");
      const umaModule = await UMAResolutionModule.deploy(umaOracleAddress, sangomaOracleAddress);
      await umaModule.waitForDeployment();
      umaModuleAddress = await umaModule.getAddress();
      console.log("UMAResolutionModule deployed to:", umaModuleAddress);

      // 3. Authorize UMAResolutionModule in SangomaOracle
      console.log("Authorizing UMAResolutionModule in SangomaOracle...");
      const sangomaOracle = await hre.ethers.getContractAt("SangomaOracle", sangomaOracleAddress);
      const tx = await sangomaOracle.setResolverStatus(umaModuleAddress, true);
      await tx.wait();
      console.log("UMAResolutionModule authorized.");
  }

  // Update deployments.json if not on local hardhat
  if (networkName !== "hardhat") {
      deployments[networkName].SangomaGovernanceToken = sngmAddress;
      deployments[networkName].UMAResolutionModule = umaModuleAddress;

      fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
      console.log("Deployments updated in shared directory.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
