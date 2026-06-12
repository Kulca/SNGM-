const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const network = await provider.getNetwork();
    console.log("Connected to", network.name, network.chainId);
}

main().catch(console.error);
