import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("Creating Pilot Markets on Amoy...");

  const FACTORY_ADDRESS = "0x529da260602643B4895CcDBCD82DB0FCE369577a";
  const ORACLE_ADDRESS = "0x1Dcecf7Ad853e4aFb6fb06cE36985AE5d7ab9B1c";
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  const factory = await hre.ethers.getContractAt("SangomaMarketFactory", FACTORY_ADDRESS);

  const metadataPath = "/home/team/shared/pilot_market_metadata.json";
  const markets = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

  const results = [];

  for (const market of markets) {
    console.log(`\nCreating market: ${market.title} (${market.id})`);
    
    // questionId is the keccak256 hash of the market string ID
    const questionId = hre.ethers.id(market.id);
    const outcomeSlotCount = 2; // YES/NO

    console.log(`  Question ID: ${questionId}`);

    const tx = await factory.createMarket(questionId, outcomeSlotCount);
    console.log(`  Transaction hash: ${tx.hash}`);
    
    await tx.wait();
    console.log(`  Market created!`);

    // Calculate Condition ID: keccak256(abi.encodePacked(oracle, questionId, outcomeSlotCount))
    // Note: outcomeSlotCount is uint256 in the real CTF, so we use that for hashing.
    const conditionId = hre.ethers.solidityPackedKeccak256(
      ["address", "bytes32", "uint256"],
      [ORACLE_ADDRESS, questionId, outcomeSlotCount]
    );
    console.log(`  Condition ID: ${conditionId}`);

    results.push({
      ...market,
      questionId,
      conditionId,
      oracle: ORACLE_ADDRESS,
      outcomeSlotCount
    });
  }

  const outputPath = "/home/team/shared/pilot_market_deployments.json";
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nAll markets created! Details saved to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
