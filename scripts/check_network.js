import hre from "hardhat";

async function main() {
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("Current block number:", blockNumber);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
