# Somnia Network Information

## 🟢 Testnet (Shannon) - Şu An Kullandığımız

| Özellik | Değer |
|---------|-------|
| **Chain ID** | 50312 |
| **Chain ID (Hex)** | 0xC488 |
| **RPC URL** | https://dream-rpc.somnia.network/ |
| **Block Explorer** | https://shannon-explorer.somnia.network/ |
| **Alt Explorer** | https://somnia-testnet.socialscan.io/ |
| **Symbol** | STT |
| **Faucet** | https://testnet.somnia.network/ |
| **Network Add** | https://testnet.somnia.network/ |

### 💰 Test Token Alma (STT)

**3 Yöntem:**

1. **Ana Faucet**
   - https://testnet.somnia.network/

2. **Alternatif Faucet'ler**
   - Google Cloud: https://cloud.google.com/application/web3/faucet/somnia/shannon
   - Stakely: https://stakely.io/faucet/somnia-testnet-stt
   - Thirdweb: https://thirdweb.com/somnia-shannon-testnet

3. **Discord**
   - Discord'a katıl: https://discord.com/invite/somnia
   - #dev-chat kanalına git
   - `@emma_odia` tag'le ve test token iste

4. **Email**
   - developers@somnia.network
   - Projenin kısa açıklaması + GitHub profili

### 🔧 Hardhat Konfigürasyonu

```javascript
networks: {
  somnia_testnet: {
    url: "https://dream-rpc.somnia.network",
    accounts: ["0xYOUR_PRIVATE_KEY"],
    chainId: 50312
  }
}
```

### 🦊 MetaMask'a Ekleme

**Otomatik:**
- https://testnet.somnia.network/ adresinden "Add to Wallet"

**Manuel:**
```
Network Name: Somnia Shannon Testnet
RPC URL: https://dream-rpc.somnia.network
Chain ID: 50312
Currency Symbol: STT
Block Explorer: https://shannon-explorer.somnia.network/
```

---

## 🔵 Mainnet - Production İçin

| Özellik | Değer |
|---------|-------|
| **Chain ID** | 5031 |
| **Chain ID (Hex)** | 0x13A7 |
| **RPC URL** | https://api.infra.mainnet.somnia.network/ |
| **Block Explorer** | https://explorer.somnia.network |
| **Symbol** | SOMI |
| **Network Add** | https://chainlist.org/?chain=5031&search=somnia |

### 💎 SOMI Token Alma (Mainnet)

⚠️ **SOMI gerçek token!** CEX/DEX'lerden satın alınmalı.

**Faucet (Küçük miktarlar için):**
- https://stakely.io/faucet/somnia-somi

### 🦊 MetaMask'a Ekleme

**Otomatik:**
- https://chainlist.org/?chain=5031&search=somnia

---

## 📡 Alternatif RPC Providers (Mainnet)

Eğer ana RPC yavaşsa alternatifler:

| Provider | URL |
|----------|-----|
| **Ankr** | https://www.ankr.com/rpc/somnia/ |
| **Public Node** | https://somnia.publicnode.com/ |
| **Stakely** | https://somnia-json-rpc.stakely.io |
| **Validation Cloud** | https://www.validationcloud.io/somnia |

---

## 🎯 Contract Adresleri (Testnet)

Somnia'nın resmi contract'ları:

| Contract | Adres |
|----------|-------|
| **MultiCallV3** | 0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223 |
| **EntryPoint v0.7** | 0x0000000071727De22E5E9d8BAf0edAc6f37da032 |
| **Factory Address** | 0x4bE0ddfebcA9A5A4a617dee4DeCe99E7c862dceb |

---

## 📚 Kaynak Bağlantıları

### Topluluk
- **Discord**: https://discord.com/invite/Somnia
- **Twitter**: https://twitter.com/Somnia_Network
- **Docs**: https://docs.somnia.network

### Developer
- **Grants Program**: https://somnia.fillout.com/t/5WqTW4iFxCus
- **Developer Community**: https://somnia.fillout.com/t/vPjjEWFLbQus

### Learning Resources
- **Learn Web3**: https://learnweb3.io/degrees/ethereum-developer-degree/
- **Solidity by Example**: https://solidity-by-example.org/
- **CryptoZombies**: https://cryptozombies.io/en/course
- **Alchemy University**: https://www.alchemy.com/university/courses/solidity

---

## 🚀 Hızlı Başlangıç

### 1. MetaMask'a Network Ekle
```bash
https://testnet.somnia.network/
# "Add to Wallet" butonuna tıkla
```

### 2. Test Token Al
```bash
https://testnet.somnia.network/
# Wallet adresini gir, token al
```

### 3. Contract Deploy
```bash
cd contracts
npm install
# hardhat.config.js'de private key ekle
npx hardhat run scripts/deploy.js --network somnia_testnet
```

### 4. Oyunu Çalıştır
```bash
npm run dev
# http://localhost:3000
```

---

## ⚠️ Önemli Notlar

1. **Private Key Güvenliği**
   - ASLA commit etme
   - `.env` dosyası kullan
   - `.gitignore`'a ekle

2. **Testnet vs Mainnet**
   - STT = Test token (ücretsiz)
   - SOMI = Gerçek token (satın alınmalı)
   - İlk testnet'te test et!

3. **Gas Fees**
   - Somnia çok ucuz ve hızlı
   - 400,000+ TPS
   - Sub-second finality

4. **RPC Limits**
   - Ana RPC yavaşsa alternatif kullan
   - Rate limiting olabilir
   - Kendi node'unu çalıştırabilirsin

