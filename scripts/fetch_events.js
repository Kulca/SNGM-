import hre from "hardhat";
import fs from "fs";

async function main() {
  const CTF_ADDRESS = "0xB81f3e0A187dFA8006b681056332d7f1b56F7c20";
  const deployments = JSON.parse(fs.readFileSync("/home/team/shared/pilot_market_deployments.json", "utf8"));
  
  console.log("Fetching ConditionPreparation events for Pilot Markets...");

  const ctf = await hre.ethers.getContractAt("MockCTF", CTF_ADDRESS);
  
  // Fetch all ConditionPreparation events
  const filter = ctf.filters.ConditionPreparation();
  const events = await ctf.queryFilter(filter);

  console.log(`Found ${events.length} ConditionPreparation events.`);

  const verifiedEvents = [];

  for (const market of deployments) {
    const event = events.find(e => e.args.questionId === market.questionId);
    if (event) {
      console.log(`✅ Event found for market: ${market.title}`);
      verifiedEvents.push({
        title: market.title,
        questionId: market.questionId,
        conditionId: market.conditionId,
        oracle: event.args.oracle,
        outcomeSlotCount: event.args.outcomeSlotCount.toString(),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    } else {
      console.log(`❌ No event found for market: ${market.title}`);
    }
  }

  const outputPath = "/home/team/shared/pilot_market_event_logs.json";
  fs.writeFileSync(outputPath, JSON.stringify(verifiedEvents, null, 2));
  console.log(`\nEvent logs saved to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
