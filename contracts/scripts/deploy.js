const hre = require("hardhat");

async function main() {
  console.log("Deploying SomiVerse Contracts...");

  // Deploy Faucet
  console.log("\n1. Deploying SomniaFaucet...");
  const Faucet = await hre.ethers.getContractFactory("SomniaFaucet");
  const faucet = await Faucet.deploy();
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("SomniaFaucet deployed to:", faucetAddress);

  // Deploy Mock ERC20 for testing (staking token)
  console.log("\n2. Deploying Mock Staking Token...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const stakingToken = await MockERC20.deploy("Somnia Token", "STT");
  await stakingToken.waitForDeployment();
  const stakingTokenAddress = await stakingToken.getAddress();
  console.log("Staking Token deployed to:", stakingTokenAddress);

  // Deploy Swap
  console.log("\n3. Deploying SomniaSwap...");
  const Swap = await hre.ethers.getContractFactory("SomniaSwap");
  const swap = await Swap.deploy();
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log("SomniaSwap deployed to:", swapAddress);

  // Deploy NFT
  console.log("\n4. Deploying SomniaNFT...");
  const NFT = await hre.ethers.getContractFactory("SomniaNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("SomniaNFT deployed to:", nftAddress);

  // Deploy Staking
  console.log("\n5. Deploying SomniaStaking...");
  const Staking = await hre.ethers.getContractFactory("SomniaStaking");
  const staking = await Staking.deploy(stakingTokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("SomniaStaking deployed to:", stakingAddress);

  // Fund faucet
  console.log("\n6. Funding Faucet...");
  const [deployer] = await hre.ethers.getSigners();
  const fundTx = await deployer.sendTransaction({
    to: faucetAddress,
    value: hre.ethers.parseEther("10.0")
  });
  await fundTx.wait();
  console.log("Faucet funded with 10 ETH");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Faucet:        ", faucetAddress);
  console.log("Swap:          ", swapAddress);
  console.log("NFT:           ", nftAddress);
  console.log("Staking:       ", stakingAddress);
  console.log("Staking Token: ", stakingTokenAddress);
  console.log("=".repeat(60));

  // Save addresses to file
  const fs = require("fs");
  const addresses = {
    faucet: faucetAddress,
    swap: swapAddress,
    nft: nftAddress,
    staking: stakingAddress,
    stakingToken: stakingTokenAddress
  };
  
  fs.writeFileSync(
    "../src/web3/contract-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nContract addresses saved to src/web3/contract-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

