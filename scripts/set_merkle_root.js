
import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const AIRDROP_ADDRESS = "0x646FfB8f0d46ce9dd908a9D2B89cE54066d10DcC";
const DISTRIBUTION_FILE = "/home/team/shared/sngm_airdrop_distribution.json";

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const distribution = JSON.parse(fs.readFileSync(DISTRIBUTION_FILE, "utf8"));
    const merkleRoot = distribution.root;

    console.log(`Setting Merkle Root: ${merkleRoot}`);
    console.log(`Airdrop Contract: ${AIRDROP_ADDRESS}`);
    console.log(`Deployer: ${wallet.address}`);

    const abi = JSON.parse(fs.readFileSync("./artifacts/contracts/SangomaAirdrop.sol/SangomaAirdrop.json", "utf8")).abi;
    const contract = new ethers.Contract(AIRDROP_ADDRESS, abi, wallet);

    const tx = await contract.setMerkleRoot(merkleRoot);
    console.log(`Transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
