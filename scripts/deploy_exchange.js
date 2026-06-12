import hre from "hardhat";

async function main() {
  console.log("Resuming Sangoma Phase 3 Deployment to Amoy...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Previously deployed addresses
  const ctfAddress = "0xB81f3e0A187dFA8006b681056332d7f1b56F7c20";
  const oracleAddress = "0x1Dcecf7Ad853e4aFb6fb06cE36985AE5d7ab9B1c";
  const factoryAddress = "0x529da260602643B4895CcDBCD82DB0FCE369577a";
  
  // Amoy Mock USDC with correct checksum
  const COLLATERAL_ADDRESS = hre.ethers.getAddress("0x41E94Eb019C0762f9bfcf9fb1E58725BfB0e7582".toLowerCase());
  
  console.log("Using MockCTF at:", ctfAddress);
  console.log("Using SangomaOracle at:", oracleAddress);
  console.log("Using SangomaMarketFactory at:", factoryAddress);
  console.log("Using Collateral (USDC) at:", COLLATERAL_ADDRESS);

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
