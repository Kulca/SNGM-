import hre from "hardhat";
import fs from "fs";

async function main() {
    const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8")).amoy;

    const SangomaMarketFactory = await hre.ethers.getContractAt("SangomaMarketFactory", deployments.SangomaMarketFactory);
    const SangomaOracle = await hre.ethers.getContractAt("SangomaOracle", deployments.SangomaOracle);
    const UMAResolutionModule = await hre.ethers.getContractAt("UMAResolutionModule", deployments.UMAResolutionModule);
    const SangomaExchange = await hre.ethers.getContractAt("SangomaExchange", deployments.SangomaExchange);

    const latestBlock = await hre.ethers.provider.getBlockNumber();
    const totalBlocks = 2000;
    const chunkSize = 100;
    
    console.log(`Searching for events from block ${latestBlock - totalBlocks} to ${latestBlock}...`);

    for (let i = latestBlock; i > latestBlock - totalBlocks; i -= chunkSize) {
        const from = Math.max(i - chunkSize, latestBlock - totalBlocks);
        const to = i;
        
        console.log(`Checking blocks ${from} to ${to}...`);

        try {
            const mkEvents = await SangomaMarketFactory.queryFilter(SangomaMarketFactory.filters.MarketCreated(), from, to);
            mkEvents.forEach(e => console.log(`[MarketCreated] QuestionID: ${e.args.questionId} at Block: ${e.blockNumber}`));

            const teEvents = await SangomaExchange.queryFilter(SangomaExchange.filters.TradeExecuted(), from, to);
            teEvents.forEach(e => console.log(`[TradeExecuted] ConditionID: ${e.args.conditionId} at Block: ${e.blockNumber}`));

            const orEvents = await SangomaOracle.queryFilter(SangomaOracle.filters.OutcomeReported(), from, to);
            orEvents.forEach(e => console.log(`[OutcomeReported] QuestionID: ${e.args.questionId} at Block: ${e.blockNumber}`));

            const amEvents = await UMAResolutionModule.queryFilter(UMAResolutionModule.filters.MarketAssertionMade(), from, to);
            amEvents.forEach(e => console.log(`[MarketAssertionMade] MarketID: ${e.args.marketId} at Block: ${e.blockNumber}`));
        } catch (e) { console.error("Error in block range", from, to, e.message); }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
