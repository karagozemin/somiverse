# SomiVerse - Isometric Web3 Universe

Somnia blockchain üzerinde izometrik bir evren oyunu. Phaser.js game engine kullanılarak geliştirilmiştir.

## Özellikler

- 🎮 **Izometrik Görünüm**: Diamond (2:1) izometrik projeksiyon
- 🎨 **Somnia Teması**: Resmi renk paleti (pembe, mor, cyan)
- 🕹️ **WASD Kontrolleri**: Akıcı karakter hareketi
- 🏢 **4 İnteraktif Bina**:
  - 💱 **Swap City** (150 puan) - Token swap işlemleri
  - 🎨 **NFT Gallery** (400 puan) - NFT mint
  - 🚰 **Token Fountain** (50 puan) - Test token faucet
  - 🔒 **Staking Tower** (250 puan) - Token staking
- 💰 **Puan Sistemi**: Her işlemde puan kazanma
- 🔗 **Web3 Entegrasyonu**: Ethers.js v6 ile cüzdan bağlantısı
- 📱 **Responsive Tasarım**: 4K'dan mobile'a ölçeklenir

## Kurulum

### 1. Ana Proje

```bash
# Dependencies yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

### 2. Smart Contracts

```bash
cd contracts

# Dependencies yükle
npm install

# Compile contracts
npm run compile

# Deploy (local)
npx hardhat run scripts/deploy.js --network hardhat

# Deploy (Somnia testnet - yapılandırmadan sonra)
npm run deploy
```

## Teknoloji Stack

- **Game Engine**: Phaser 3.80+
- **Web3**: Ethers.js v6
- **Build Tool**: Vite
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Blockchain**: Somnia Testnet (EVM compatible)

## Proje Yapısı

```
somnia/
├── src/
│   ├── main.js                 # Phaser game instance
│   ├── scenes/                 # Phaser scenes
│   │   ├── BootScene.js        # Asset loading
│   │   ├── MainScene.js        # Main game loop
│   │   └── UIScene.js          # UI overlay
│   ├── entities/               # Game entities
│   │   ├── Player.js           # Player character
│   │   └── Building.js         # Interactive buildings
│   ├── web3/                   # Web3 integration
│   │   ├── wallet.js           # Wallet connection
│   │   ├── points.js           # Points management
│   │   └── contracts.js        # Contract interactions
│   ├── ui/                     # UI components
│   │   └── popups/             # Popup components
│   │       ├── PopupManager.js
│   │       ├── SwapPopup.js
│   │       ├── NFTPopup.js
│   │       ├── FaucetPopup.js
│   │       └── StakingPopup.js
│   └── styles/
│       └── main.css            # Somnia themed styles
├── contracts/                  # Smart contracts
│   ├── contracts/
│   │   ├── SomniaFaucet.sol
│   │   ├── SomniaSwap.sol
│   │   ├── SomniaNFT.sol
│   │   └── SomniaStaking.sol
│   └── scripts/
│       └── deploy.js
├── index.html
├── package.json
└── vite.config.js
```

## Kontroller

- **WASD** veya **Ok Tuşları**: Karakter hareketi
- **E** veya **Space**: Binalarla etkileşim
- **ESC**: Pop-up'ı kapat

## Puan Sistemi

| İşlem | Puan | Zorluk |
|-------|------|--------|
| Faucet | 50 | Kolay |
| Swap | 150 | Orta |
| Staking | 250 | İyi |
| NFT Mint | 400 | Zor |

Puanlar cüzdan adresine göre localStorage'da saklanır.

## Smart Contracts

### SomniaFaucet
Test token dağıtımı için faucet. 24 saat cooldown ile 100 STT token.

### SomniaSwap
Basit AMM-style DEX. 0.3% swap fee.

### SomniaNFT
ERC721 NFT collection. Max supply 10,000.

### SomniaStaking
Token staking ile %25 APY. 7 gün lock period.

## Somnia Testnet Konfigürasyonu

```javascript
{
  chainId: '0x7A31', // 31281 (Placeholder - gerçek değeri kullanın)
  chainName: 'Somnia Testnet',
  rpcUrls: ['https://dream-rpc.somnia.network'],
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18
  }
}
```

## Geliştirme

```bash
# Dev mode (hot reload)
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Contract Deploy

1. `contracts/hardhat.config.js` dosyasında private key ekleyin
2. Somnia testnet RPC URL'ini güncelleyin
3. Deploy:

```bash
cd contracts
npm run deploy
```

Contract adresleri `src/web3/contract-addresses.json` dosyasına kaydedilir.

## Lisans

MIT

## İletişim

SomiVerse - Web3 Universe Gaming Experience

