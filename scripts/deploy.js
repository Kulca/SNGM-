import hre from "hardhat";

async function main() {
  console.log("Deploying Sangoma Phase 3 Contracts to Amoy...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockCTF (since official CTF is not on Amoy)
  console.log("Deploying MockCTF...");
  const MockCTF = await hre.ethers.getContractFactory("MockCTF");
  const ctf = await MockCTF.deploy();
  await ctf.waitForDeployment();
  const ctfAddress = await ctf.getAddress();
  console.log("MockCTF deployed to:", ctfAddress);

  // Use the verified Mock USDC on Amoy or deploy a new one?
  // Researcher found one at 0x41E94Eb019C0762f9bfcf9fb1E58725BfB0e7582
  const COLLATERAL_ADDRESS = "0x41E94Eb019C0762f9bfcf9fb1E58725BfB0e7582";
  const SME_ADDRESS = deployer.address; // Using deployer as initial SME relayer

  // 2. Deploy SangomaOracle
  console.log("Deploying SangomaOracle...");
  const SangomaOracle = await hre.ethers.getContractFactory("SangomaOracle");
  const oracle = await SangomaOracle.deploy(ctfAddress, SME_ADDRESS);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("SangomaOracle deployed to:", oracleAddress);

  // 3. Deploy SangomaMarketFactory
  console.log("Deploying SangomaMarketFactory...");
  const SangomaMarketFactory = await hre.ethers.getContractFactory("SangomaMarketFactory");
  const factory = await SangomaMarketFactory.deploy(ctfAddress, oracleAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("SangomaMarketFactory deployed to:", factoryAddress);

  // 4. Deploy SangomaExchange
  console.log("Deploying SangomaExchange...");
  const SangomaExchange = await hre.ethers.getContractFactory("SangomaExchange");
  const exchange = await SangomaExchange.deploy(
    ctfAddress,
    COLLATERAL_ADDRESS,
    "Sangoma Matching Engine",
    "1.0"
  );
  await exchange.waitForDeployment();
  const exchangeAddress = await exchange.getAddress();
  console.log("SangomaExchange deployed to:", exchangeAddress);

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("MockCTF:", ctfAddress);
  console.log("SangomaOracle:", oracleAddress);
  console.log("SangomaMarketFactory:", factoryAddress);
  console.log("SangomaExchange:", exchangeAddress);
  console.log("Collateral (USDC):", COLLATERAL_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
