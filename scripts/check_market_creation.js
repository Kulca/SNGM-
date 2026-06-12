import hre from "hardhat";
import fs from "fs";

async function main() {
    const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8")).amoy;

    const SangomaMarketFactory = await hre.ethers.getContractAt("SangomaMarketFactory", deployments.SangomaMarketFactory);

    console.log("Fetching recent MarketCreated events from SangomaMarketFactory...");

    const latestBlock = await hre.ethers.provider.getBlockNumber();
    const fromBlock = latestBlock - 50;

    const filter = SangomaMarketFactory.filters.MarketCreated();
    const events = await SangomaMarketFactory.queryFilter(filter, fromBlock, latestBlock);
    
    console.log(`\nFound ${events.length} MarketCreated events:`);
    events.forEach(e => {
        console.log(`- Question ID: ${e.args.questionId}`);
        console.log(`  Outcome Slot Count: ${e.args.outcomeSlotCount}`);
        console.log(`  Oracle: ${e.args.oracle}`);
        console.log(`  Tx: ${e.transactionHash}`);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
