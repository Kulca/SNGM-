import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const rpcUrl = "https://polygon-amoy-bor-rpc.publicnode.com";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const exchangeAddress = "0xe302CA1137bC0BEe3A1A615C485b8Bc54262D47f";
    const abi = [
        "event TradeExecuted(bytes32 indexed questionId, address indexed buyer, address indexed seller, uint256 amount, uint256 price)"
    ];

    const exchange = new ethers.Contract(exchangeAddress, abi, provider);

    const endBlock = await provider.getBlockNumber();
    const startBlock = 39420000;
    const chunkSize = 2000;

    console.log(`Searching for TradeExecuted events from ${startBlock} to ${endBlock}...`);

    const participantsMap = new Map();

    for (let from = startBlock; from < endBlock; from += chunkSize) {
        const to = Math.min(from + chunkSize - 1, endBlock);
        
        try {
            const events = await exchange.queryFilter(exchange.filters.TradeExecuted(), from, to);
            if (events.length > 0) {
                console.log(`Blocks ${from}-${to}: Found ${events.length} trades`);
                for (const e of events) {
                    const { buyer, seller, amount, price } = e.args;
                    const volume = (amount * price) / BigInt(1e18);

                    participantsMap.set(buyer, (participantsMap.get(buyer) || BigInt(0)) + volume);
                    participantsMap.set(seller, (participantsMap.get(seller) || BigInt(0)) + volume);
                    
                    console.log(`  Trade: Buyer ${buyer}, Seller ${seller}, Vol ${volume}`);
                }
            } else if (from % 10000 === 0) {
                process.stdout.write(".");
            }
        } catch (err) {
            console.error(`Error querying range ${from}-${to}: ${err.message}`);
        }
    }

    const participants = [];
    participantsMap.forEach((volume, address) => {
        participants.push({ address, volume: volume.toString() });
    });

    console.log(`\nFound ${participants.length} unique participants.`);
    fs.writeFileSync("participants_data_node.json", JSON.stringify(participants, null, 2));
}

main().catch(console.error);
