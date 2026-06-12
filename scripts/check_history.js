import { ethers } from "ethers";

async function main() {
    const rpcUrl = "https://polygon-amoy-bor-rpc.publicnode.com";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const latestBlock = await provider.getBlockNumber();
    console.log("Latest block:", latestBlock);

    for (let i = 0; i < 100; i++) {
        const blockNum = latestBlock - (i * 10000);
        try {
            await provider.getBlock(blockNum);
            console.log(`Block ${blockNum} is available`);
        } catch (err) {
            console.log(`Block ${blockNum} is NOT available: ${err.message}`);
            break;
        }
    }
}

main().catch(console.error);
