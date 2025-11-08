// TEMPLATE FILE - Copy this to faucet.config.local.js and add your private key
// faucet.config.local.js is in .gitignore and will not be committed

export const FAUCET_CONFIG = {
    privateKey: 'YOUR_PRIVATE_KEY_HERE', // Replace with your faucet wallet private key
    amount: '0.1', // Amount to send per request
    cooldown: 86400000 // 24 hours in milliseconds
};

