import hre from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const networkName = hre.network.name;
  console.log("Network:", networkName);

  // Load existing deployments
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
      deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }

  if (!deployments[networkName]) {
    const network = await deployer.provider.getNetwork();
    deployments[networkName] = { chainId: Number(network.chainId) };
  }

  const ctfAddress = deployments[networkName].MockCTF;
  // UMA OO V3 address from researcher's findings on Amoy
  const umaOracleAddress = networkName === "amoy" ? "0xd8866E76441df243fc98B892362Fc6264dC3ca80" : "0x0000000000000000000000000000000000000000";

  console.log("Using MockCTF at:", ctfAddress);

  // 1. Redeploy SangomaOracle (to support multiple resolvers)
  console.log("Deploying SangomaOracle...");
  const SangomaOracle = await hre.ethers.getContractFactory("SangomaOracle");
  // Set initial SME to the deployer for now
  const sangomaOracle = await SangomaOracle.deploy(ctfAddress, deployer.address);
  await sangomaOracle.waitForDeployment();
  const sangomaOracleAddress = await sangomaOracle.getAddress();
  console.log("SangomaOracle deployed to:", sangomaOracleAddress);

  // 2. Redeploy SangomaMarketFactory
  console.log("Deploying SangomaMarketFactory...");
  const SangomaMarketFactory = await hre.ethers.getContractFactory("SangomaMarketFactory");
  const factory = await SangomaMarketFactory.deploy(ctfAddress, sangomaOracleAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("SangomaMarketFactory deployed to:", factoryAddress);

  // 3. Deploy SangomaGovernanceToken (SNGM)
  console.log("Deploying SangomaGovernanceToken...");
  const SNGM = await hre.ethers.getContractFactory("SangomaGovernanceToken");
  const sngm = await SNGM.deploy();
  await sngm.waitForDeployment();
  const sngmAddress = await sngm.getAddress();
  console.log("SangomaGovernanceToken deployed to:", sngmAddress);

  // 4. Deploy UMAResolutionModule
  console.log("Deploying UMAResolutionModule...");
  const UMAResolutionModule = await hre.ethers.getContractFactory("UMAResolutionModule");
  const umaModule = await UMAResolutionModule.deploy(umaOracleAddress, sangomaOracleAddress);
  await umaModule.waitForDeployment();
  const umaModuleAddress = await umaModule.getAddress();
  console.log("UMAResolutionModule deployed to:", umaModuleAddress);

  // 5. Authorize UMAResolutionModule in SangomaOracle
  console.log("Authorizing UMAResolutionModule in SangomaOracle...");
  const authTx = await sangomaOracle.setResolverStatus(umaModuleAddress, true);
  await authTx.wait();
  console.log("UMAResolutionModule authorized.");

  // Update deployments.json
  deployments[networkName].SangomaOracle = sangomaOracleAddress;
  deployments[networkName].SangomaMarketFactory = factoryAddress;
  deployments[networkName].SangomaGovernanceToken = sngmAddress;
  deployments[networkName].UMAResolutionModule = umaModuleAddress;

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("Deployments updated in shared directory.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
