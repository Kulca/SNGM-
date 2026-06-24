const { ethers } = require("hardhat");

async function main() {
  const ctfAddress = "0xB81f3e0A187dFA8006b681056332d7f1b56F7c20";
  const MockCTF = await ethers.getContractAt("MockCTF", ctfAddress);

  const markets = [
    {
      name: "Eskom Stage 0 Streak (July 2026)",
      questionId: "0x3ad8f46b02256585f7c767ddfb4266ad011560a1966cb2604dfad214a661c425"
    },
    {
      name: "SARB Repo Rate Decision (July 2026)",
      questionId: "0x0a77b446ab417982354c334f40101a70df2af810285c1a7d0a31c81fd2c79342"
    },
    {
      name: "95 Unleaded Petrol Price (August 2026)",
      questionId: "0xf27b8b35cc739906b6849d563922f368f9a1965b75ab2bbb876bd7d5bcf6ad10"
    }
  ];

  for (const market of markets) {
    try {
      const condition = await MockCTF.conditions(market.questionId);
      console.log(`Market: ${market.name}`);
      console.log(`  QuestionID: ${market.questionId}`);
      console.log(`  Prepared: ${condition.prepared}`);
      console.log(`  Oracle: ${condition.oracle}`);
      
      const payouts = await MockCTF.getPayouts(market.questionId);
      console.log(`  Payouts: [${payouts.join(", ")}]`);
      console.log(`  Resolved: ${payouts.length > 0}`);
    } catch (error) {
      console.error(`Error checking market ${market.name}:`, error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
