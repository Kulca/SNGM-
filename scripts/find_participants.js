import hre from "hardhat";
import fs from "fs";

async function main() {
    const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8")).amoy;

    const SangomaExchange = await hre.ethers.getContractAt("SangomaExchange", deployments.SangomaExchange);

    const latestBlock = await hre.ethers.provider.getBlockNumber();
    // Scan back 1,000,000 blocks to be safe.
    const searchRange = 1000000;
    const fromBlock = Math.max(0, latestBlock - searchRange);
    const chunkSize = 100;
    
    console.log(`Searching for TradeExecuted events from block ${fromBlock} to ${latestBlock}...`);

    const participantsMap = new Map(); // address -> totalVolume

    for (let i = latestBlock; i > fromBlock; i -= chunkSize) {
        const start = Math.max(i - chunkSize, fromBlock);
        const end = i;
        
        if (i % 1000 === 0) {
            console.log(`Checking block ${i}...`);
        }

        try {
            const events = await SangomaExchange.queryFilter(SangomaExchange.filters.TradeExecuted(), start, end);
            events.forEach(e => {
                const buyer = e.args.buyer;
                const seller = e.args.seller;
                const amount = e.args.amount;
                const price = e.args.price;
                const volume = (amount * price) / BigInt(1e18);

                participantsMap.set(buyer, (participantsMap.get(buyer) || BigInt(0)) + volume);
                participantsMap.set(seller, (participantsMap.get(seller) || BigInt(0)) + volume);

                console.log(`Found trade: Buyer ${buyer}, Seller ${seller}, Volume ${volume} at block ${e.blockNumber}`);
            });
        } catch (err) {
            console.error(`Error querying range ${start}-${end}: ${err.message}`);
        }
    }

    const participants = [];
    participantsMap.forEach((volume, address) => {
        participants.push({
            address,
            volume: volume.toString()
        });
    });

    console.log(`\nFound ${participants.length} unique participants.`);
    fs.writeFileSync("participants_data.json", JSON.stringify(participants, null, 2));
    console.log("Results saved to participants_data.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
