import hre from "hardhat";

async function main() {
  const addressWhitelistAddr = "0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64";
  const abi = [
    "function getWhitelist() external view returns (address[])"
  ];
  const [deployer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt(abi, addressWhitelistAddr);
  
  const whitelist = await contract.getWhitelist();
  console.log("Whitelisted addresses:", whitelist);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
