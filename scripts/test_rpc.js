import hre from "hardhat";

async function main() {
    const SangomaExchange = await hre.ethers.getContractAt("SangomaExchange", "0xe302CA1137bC0BEe3A1A615C485b8Bc54262D47f");

    const latestBlock = await hre.ethers.provider.getBlockNumber();
    console.log("Latest block:", latestBlock);

    try {
        const events = await SangomaExchange.queryFilter(SangomaExchange.filters.TradeExecuted(), latestBlock - 1000, latestBlock);
        console.log("Successfully queried 1000 blocks. Found events:", events.length);
    } catch (err) {
        console.error("Failed to query 1000 blocks:", err.message);
    }

    try {
        const events = await SangomaExchange.queryFilter(SangomaExchange.filters.TradeExecuted(), latestBlock - 100, latestBlock);
        console.log("Successfully queried 100 blocks. Found events:", events.length);
    } catch (err) {
        console.error("Failed to query 100 blocks:", err.message);
    }
}

main().catch(console.error);
