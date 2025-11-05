# Deployment Guide - Somnia Land

## Local Development

### 1. Ana Projeyi Çalıştırma

```bash
# Dependencies yükle
npm install

# Dev sunucusunu başlat (http://localhost:3000)
npm run dev
```

### 2. Test Etme

1. Tarayıcıda `http://localhost:3000` açın
2. Oyun yüklendikten sonra WASD ile karakteri hareket ettirin
3. Binalara yaklaşın (E veya Space ile etkileşim)
4. "Connect Wallet" butonuna tıklayın (MetaMask gerekli)
5. Her binada farklı işlemler yapıp puan kazanın

## Smart Contract Deployment

### Hazırlık

1. MetaMask'ta Somnia Testnet ekleyin:
```javascript
Network Name: Somnia Testnet
RPC URL: https://dream-rpc.somnia.network
Chain ID: 31281 (Gerçek değeri Somnia dokümantasyonundan alın)
Currency Symbol: STT
```

2. Test token alın (Somnia faucet'tan)

### Deploy

```bash
cd contracts

# Dependencies yükle
npm install

# Compile contracts
npx hardhat compile

# Local test deploy
npx hardhat run scripts/deploy.js --network hardhat

# Somnia testnet deploy
# Önce hardhat.config.js'de private key ekleyin!
npx hardhat run scripts/deploy.js --network somnia_testnet
```

### Deploy Sonrası

1. Contract adresleri `src/web3/contract-addresses.json` dosyasına otomatik kaydedilir
2. `src/web3/contracts.js` dosyasındaki contract adreslerini güncelleyin
3. Frontend'i yeniden başlatın

## Production Build

```bash
# Production build oluştur
npm run build

# Build'i test et
npm run preview

# Deploy (Vercel, Netlify, vb.)
# dist/ klasörünü deploy edin
```

## Environment Variables

`.env` dosyası oluşturun (opsiyonel):

```bash
VITE_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
VITE_SOMNIA_CHAIN_ID=31281
VITE_FAUCET_ADDRESS=0x...
VITE_SWAP_ADDRESS=0x...
VITE_NFT_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
```

## Somnia Testnet Konfigürasyonu

### RPC Endpoints

Somnia'nın resmi dokümantasyonundan güncel RPC endpoint'i alın:
- https://docs.somnia.network

### Chain Info

`src/web3/wallet.js` dosyasında Somnia config'i güncelleyin:

```javascript
this.somniaConfig = {
  chainId: '0x7A31', // Gerçek chain ID'yi girin
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18
  },
  rpcUrls: ['GERÇEK_RPC_URL'],
  blockExplorerUrls: ['GERÇEK_EXPLORER_URL']
};
```

## Troubleshooting

### "Please install MetaMask" hatası
- MetaMask extension'ı yükleyin
- Tarayıcıyı yeniden başlatın

### Network hatası
- Somnia Testnet'in MetaMask'ta ekli olduğundan emin olun
- RPC URL'in doğru olduğunu kontrol edin

### Transaction başarısız
- Cüzdanınızda yeterli test token olduğundan emin olun
- Gas fee'yi artırın
- Network'ün çalıştığını kontrol edin

### Oyun yüklenmiyor
- Console'da hata var mı kontrol edin (F12)
- Tarayıcı cache'ini temizleyin
- Dependencies güncel mi kontrol edin: `npm install`

## Contract Adresleri Güncelleme

Deploy sonrası contract adreslerini manuel olarak güncellemeniz gerekirse:

`src/web3/contracts.js` dosyasında:

```javascript
this.contracts = {
  faucet: 'DEPLOY_EDİLEN_FAUCET_ADRESİ',
  swap: 'DEPLOY_EDİLEN_SWAP_ADRESİ',
  nft: 'DEPLOY_EDİLEN_NFT_ADRESİ',
  staking: 'DEPLOY_EDİLEN_STAKING_ADRESİ'
};
```

## Performance Optimization

Production için:
1. Vite otomatik olarak minify eder
2. Code splitting aktif
3. Asset optimization yapılır
4. Lazy loading uygulanır

## Security

⚠️ **ÖNEMLİ**:
- Private key'leri ASLA commit etmeyin
- `.env` dosyasını `.gitignore`'a ekleyin
- Production'da güvenli key management kullanın
- Smart contract audit yaptırın (production için)

## Monitoring

Deploy sonrası izleme:
- Transaction explorer kullanın
- Gas fee'leri takip edin
- User feedback toplayın
- Error tracking ekleyin (Sentry vb.)

## Updates

Güncelleme yaparken:
1. Contract'ları yeniden deploy etmeyin (veri kaybı olur)
2. Frontend güncellemeleri için sadece `npm run build` ve deploy
3. Contract upgrade gerekiyorsa proxy pattern kullanın

## Support

- Somnia Docs: https://docs.somnia.network
- Discord: https://discord.com/invite/somnia
- GitHub Issues: Proje repository'sinde

