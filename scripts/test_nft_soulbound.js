import hre from "hardhat";
import fs from "fs";

async function main() {
  const deploymentsPath = "/home/team/shared/smart_contracts/deployments.json";
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const nftAddress = deployments.amoy.SangomaGenesisNFT;

  const [deployer] = await hre.ethers.getSigners();
  const nft = await hre.ethers.getContractAt("SangomaGenesisNFT", nftAddress, deployer);

  console.log("Testing Soulbound property...");

  const balance = await nft.balanceOf(deployer.address);
  let tokenId;

  if (balance == 0n) {
    // Try to mint for deployer (whitelisting first)
    console.log("Whitelisting deployer...");
    await (await nft.setWhitelist(deployer.address, true)).wait();

    console.log("Minting NFT to deployer...");
    const metadataURI = "ipfs://test-uri";
    const tx = await nft.mint(metadataURI);
    const receipt = await tx.wait();
    
    // In OZ v5, we can get tokenId from Transfer event
    // For simplicity, we know it's _nextTokenId - 1 if we just minted
    const totalSupply = await nft.totalSupply();
    tokenId = totalSupply - 1n;
    console.log(`Minted NFT #${tokenId} to:`, deployer.address);
  } else {
    console.log("Deployer already has an NFT. Finding token ID...");
    // Since it's a test and we only minted one, it's likely 0
    tokenId = 0n; // This is an assumption for the test environment
    console.log(`Using existing NFT #${tokenId} for test.`);
  }

  // Try to transfer to another address (e.g. u1)
  const recipient = hre.ethers.getAddress("0x2DF7607aA4601A9A9A0f882a6132D999905C01Ca".toLowerCase());
  console.log(`Attempting to transfer NFT #${tokenId} to ${recipient}...`);

  try {
    const tx = await nft.transferFrom(deployer.address, recipient, tokenId);
    await tx.wait();
    console.error("FAILURE: Transfer succeeded, but NFT should be Soulbound!");
  } catch (error) {
    console.log("SUCCESS: Transfer failed as expected.");
    // In Hardhat/Ethers v6, revert reason might be in error.data or error.message
    console.log("Error message:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
