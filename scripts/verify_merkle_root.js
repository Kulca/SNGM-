
import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const AIRDROP_ADDRESS = "0x646FfB8f0d46ce9dd908a9D2B89cE54066d10DcC";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    
    const abi = JSON.parse(fs.readFileSync("./artifacts/contracts/SangomaAirdrop.sol/SangomaAirdrop.json", "utf8")).abi;
    const contract = new ethers.Contract(AIRDROP_ADDRESS, abi, provider);

    const currentRoot = await contract.merkleRoot();
    console.log(`Current Merkle Root on Contract: ${currentRoot}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
