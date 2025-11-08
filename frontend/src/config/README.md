# Faucet Configuration

## Setup Instructions

1. **Copy the template file:**
   ```bash
   cp faucet.config.template.js faucet.config.local.js
   ```

2. **Edit `faucet.config.local.js` and add your private key:**
   ```javascript
   export const FAUCET_CONFIG = {
       privateKey: 'YOUR_ACTUAL_PRIVATE_KEY_HERE',
       amount: '0.1',
       cooldown: 86400000 // 24 hours
   };
   ```

3. **Security Notes:**
   - ✅ `faucet.config.local.js` is in `.gitignore` and will NOT be committed
   - ✅ Only use test wallets with small amounts
   - ✅ Never commit real private keys to Git
   - ⚠️ Make sure you have STT in the faucet wallet

## Faucet Wallet Setup

1. Create a new wallet for faucet distribution
2. Send some STT to this wallet (e.g., 10 STT)
3. Copy the private key
4. Paste it in `faucet.config.local.js`

## Configuration Options

- `privateKey`: The private key of the faucet wallet
- `amount`: Amount to send per request (in STT)
- `cooldown`: Time between claims in milliseconds (default: 24 hours)

