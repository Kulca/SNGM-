import hre from "hardhat";
import fs from "fs";

async function main() {
  const deployments = JSON.parse(fs.readFileSync("/home/team/shared/pilot_market_deployments.json", "utf8"));
  const CTF_ADDRESS = "0xB81f3e0A187dFA8006b681056332d7f1b56F7c20";
  console.log("Verifying Pilot Markets on Amoy (MockCTF)...");
  const ctf = await hre.ethers.getContractAt("MockCTF", CTF_ADDRESS);

  for (const market of deployments) {
    console.log("\nMarket: " + market.title);
    const condition = await ctf.conditions(market.questionId);
    console.log("  Oracle: " + condition.oracle);
    console.log("  Prepared: " + condition.prepared);
  }
}

main().catch(console.error);
