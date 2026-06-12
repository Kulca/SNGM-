import hre from "hardhat";
import fs from "fs";

async function main() {
    const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8")).amoy;

    const SangomaOracle = await hre.ethers.getContractAt("SangomaOracle", deployments.SangomaOracle);
    const UMAResolutionModule = await hre.ethers.getContractAt("UMAResolutionModule", deployments.UMAResolutionModule);

    console.log("Fetching recent events from SangomaOracle and UMAResolutionModule...");

    const latestBlock = await hre.ethers.provider.getBlockNumber();
    const fromBlock = latestBlock - 100; // Last 100 blocks

    console.log(`Querying from block ${fromBlock} to ${latestBlock}...`);

    // Fetch OutcomeReported events from SangomaOracle
    const oracleFilter = SangomaOracle.filters.OutcomeReported();
    const oracleEvents = await SangomaOracle.queryFilter(oracleFilter, fromBlock, latestBlock);
    console.log(`\n[SangomaOracle] Found ${oracleEvents.length} OutcomeReported events:`);
    oracleEvents.forEach(e => {
        console.log(`- Question ID: ${e.args.questionId}`);
        console.log(`  Payouts: ${e.args.payouts.map(p => p.toString())}`);
        console.log(`  Tx: ${e.transactionHash}`);
    });

    // Fetch MarketAssertionMade events from UMAResolutionModule
    const assertionFilter = UMAResolutionModule.filters.MarketAssertionMade();
    const assertionEvents = await UMAResolutionModule.queryFilter(assertionFilter, fromBlock, latestBlock);
    console.log(`\n[UMAResolutionModule] Found ${assertionEvents.length} MarketAssertionMade events:`);
    assertionEvents.forEach(e => {
        console.log(`- Market ID: ${e.args.marketId}`);
        console.log(`  Assertion ID: ${e.args.assertionId}`);
        console.log(`  Claim: ${e.args.claim}`);
        console.log(`  Tx: ${e.transactionHash}`);
    });

    // Fetch MarketSettledOnUMA events from UMAResolutionModule
    const settlementFilter = UMAResolutionModule.filters.MarketSettledOnUMA();
    const settlementEvents = await UMAResolutionModule.queryFilter(settlementFilter, fromBlock, latestBlock);
    console.log(`\n[UMAResolutionModule] Found ${settlementEvents.length} MarketSettledOnUMA events:`);
    settlementEvents.forEach(e => {
        console.log(`- Market ID: ${e.args.marketId}`);
        console.log(`  Assertion ID: ${e.args.assertionId}`);
        console.log(`  Success: ${e.args.success}`);
        console.log(`  Tx: ${e.transactionHash}`);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
