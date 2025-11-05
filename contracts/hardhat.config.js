require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    somnia_testnet: {
      url: "https://dream-rpc.somnia.network",
      accounts: [], // Add your private key here: ["0xYOUR_PRIVATE_KEY"]
      chainId: 50312 // Somnia Shannon Testnet
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

