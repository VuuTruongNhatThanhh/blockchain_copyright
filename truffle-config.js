require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require('@truffle/hdwallet-provider')
const fs = require('fs')


module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider({
      mnemonic: {
      phrase: "begin cash usual slogan scan air dirt message judge flower champion hamster"
      },
      providerOrUrl: "https://sepolia.infura.io/v3/9533dcace3bc40b09d71234a378f85f0"
      }),
      network_id: 11155111, // Sepolia's network ID
      gas: 4000000, // Adjust the gas limit as per your requirements
      gasPrice: 10000000000, // Set the gas price to an appropriate value
      confirmations: 2, // Set the number of confirmations needed for a transaction
      timeoutBlocks: 200, // Set the timeout for transactions
      skipDryRun: true, // Skip the dry run option
      from: "0x571Ae547E70e25A8F2CB8e79529Ef8138989Dd2D"
     }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
