# SomiVerse - Isometric Web3 Universe

<img src="./frontend/src/assets/logo.jpeg" alt="SomiVerse Logo" width="200" height="200" />

An isometric universe game built on the Somnia blockchain. Developed using Phaser.js game engine.

## Features

- 🎮 **Isometric View**: Diamond (2:1) isometric projection
- 🎨 **Somnia Theme**: Official color palette (pink, purple, cyan)
- 🕹️ **WASD Controls**: Smooth character movement
- 🏢 **4 Interactive Buildings**:
  - 💱 **Swap City** (150 points) - Token swap operations
  - 🎨 **NFT Gallery** (400 points) - NFT minting
  - 🚰 **Token Fountain** (50 points) - Test token faucet
  - 🔒 **Staking Tower** (250 points) - Token staking
- 💰 **Points System**: Earn points with every transaction
- 🔗 **Web3 Integration**: Wallet connection with Ethers.js v6
- 📱 **Responsive Design**: Scales from 4K to mobile

## Installation

### 1. Main Project

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Production build
npm run build
```

### 2. Smart Contracts

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy (local)
npx hardhat run scripts/deploy.js --network hardhat

# Deploy (Somnia testnet - after configuration)
npm run deploy
```

## Tech Stack

- **Game Engine**: Phaser 3.80+
- **Web3**: Ethers.js v6
- **Build Tool**: Vite
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Blockchain**: Somnia Testnet (EVM compatible)

## Project Structure

```
somnia/
├── frontend/                 # Frontend application
│   ├── src/
│   │   ├── main.js          # Phaser game instance
│   │   ├── scenes/          # Phaser scenes
│   │   │   ├── BootScene.js        # Asset loading
│   │   │   ├── MainScene.js        # Main game loop
│   │   │   └── UIScene.js          # UI overlay
│   │   ├── entities/        # Game entities
│   │   │   ├── Player.js           # Player character
│   │   │   └── Building.js         # Interactive buildings
│   │   ├── web3/            # Web3 integration
│   │   │   ├── wallet.js           # Wallet connection
│   │   │   ├── points.js           # Points management
│   │   │   └── contracts.js        # Contract interactions
│   │   ├── ui/              # UI components
│   │   │   └── popups/             # Popup components
│   │   │       ├── PopupManager.js
│   │   │       ├── SwapPopup.js
│   │   │       ├── NFTPopup.js
│   │   │       ├── FaucetPopup.js
│   │   │       └── StakingPopup.js
│   │   └── styles/
│   │       └── main.css            # Somnia themed styles
│   ├── public/              # Static assets
│   └── package.json
├── contracts/               # Smart contracts
│   ├── contracts/
│   │   ├── SomniaFaucet.sol
│   │   ├── SomniaSwap.sol
│   │   ├── SomniaNFT.sol
│   │   └── SomniaStaking.sol
│   └── scripts/
│       └── deploy.js
└── README.md
```

## Controls

- **WASD** or **Arrow Keys**: Character movement
- **E** or **Space**: Interact with buildings
- **ESC**: Close popup

## Points System

| Action | Points | Difficulty |
|--------|--------|------------|
| Faucet | 50 | Easy |
| Swap | 150 | Medium |
| Staking | 250 | Good |
| NFT Mint | 400 | Hard |

Points are stored in localStorage by wallet address.

## Smart Contracts

### SomniaFaucet
Faucet for test token distribution. 100 STT tokens with 24-hour cooldown.

### SomniaSwap
Simple AMM-style DEX. 0.3% swap fee.

### SomniaNFT
ERC721 NFT collection. Max supply 10,000.

### SomniaStaking
Token staking with 25% APY. 7-day lock period.

## Somnia Testnet Configuration

```javascript
{
  chainId: '0xC488', // 50312 (Somnia Shannon Testnet)
  chainName: 'Somnia Shannon Testnet',
  rpcUrls: ['https://dream-rpc.somnia.network'],
  blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18
  }
}
```

## Development

```bash
# Dev mode (hot reload)
cd frontend
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Contract Deployment

1. Add your private key in `contracts/hardhat.config.js`
2. Update Somnia testnet RPC URL if needed
3. Deploy:

```bash
cd contracts
npm run deploy
```

Contract addresses are saved to `frontend/src/web3/contract-addresses.json`.

## Faucet Configuration

### Local Development

Create `frontend/src/config/faucet.config.local.js`:

```javascript
export const FAUCET_CONFIG = {
    privateKey: 'YOUR_PRIVATE_KEY_HERE',
    amount: '0.1',
    cooldown: 86400000 // 24 hours
};
```

### Production (Vercel)

Set environment variables in Vercel dashboard:
- `VITE_FAUCET_PRIVATE_KEY`: Faucet wallet private key
- `VITE_FAUCET_AMOUNT`: Amount per claim (optional, default: 0.1)
- `VITE_FAUCET_COOLDOWN`: Cooldown in milliseconds (optional, default: 86400000)

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

The application will automatically build and deploy.

## Troubleshooting

### Wallet Connection Issues

- Ensure MetaMask or compatible wallet is installed
- Check that you're on the correct network (Somnia Testnet)
- Clear browser cache and reload

### Faucet Not Working

- Verify environment variables are set correctly (for production)
- Check faucet wallet has sufficient STT balance
- Ensure cooldown period has passed

### Contract Interaction Errors

- Verify contract addresses are correct
- Check network connection
- Ensure sufficient gas (STT) for transactions

## Security Notes

- Never commit private keys to version control
- Use test wallets with minimal funds
- `faucet.config.local.js` is in `.gitignore`
- Environment variables are used for production secrets

## License

MIT

## Contact

SomiVerse - Web3 Universe Gaming Experience
