import hre from "hardhat";
import fs from "fs";

async function main() {
    const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8")).amoy;

    const rpcUrl = "https://polygon-amoy.drpc.org";
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
    const SangomaMarketFactory = await hre.ethers.getContractAt("SangomaMarketFactory", deployments.SangomaMarketFactory, provider);
    
    const latestBlock = await hre.ethers.provider.getBlockNumber();
    const startBlock = 38000000;
    const chunkSize = 500;
    
    console.log(`Searching for MarketCreated events from block ${startBlock} to ${latestBlock}...`);

    for (let from = startBlock; from < latestBlock; from += chunkSize) {
        const to = Math.min(from + chunkSize - 1, latestBlock);
        try {
            const events = await SangomaMarketFactory.queryFilter(SangomaMarketFactory.filters.MarketCreated(), from, to);
            if (events.length > 0) {
                console.log(`Checking blocks ${from} to ${to}... Found ${events.length} events`);
                events.forEach(e => {
                    console.log(`[MarketCreated] QuestionID: ${e.args.questionId} Block: ${e.blockNumber}`);
                });
            } else if (from % 10000 === 0) {
                // console.log(`Checking block ${from}...`);
            }
        } catch (err) {
            // console.error(`Error querying range ${from}-${to}: ${err.message}`);
        }
    }
}

main().catch(console.error);
