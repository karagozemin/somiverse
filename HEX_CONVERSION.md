# Hex Conversion - Düzeltildi

## ✅ Doğru Değer

**Somnia Shannon Testnet Chain ID:**
- **Decimal:** 50312
- **Hex:** 0xC488

## 🔢 Dönüşüm Hesaplaması

### Decimal → Hex (50312 → 0xC488)

```
50312 ÷ 16 = 3144 kalan 8
3144 ÷ 16 = 196 kalan 8
196 ÷ 16 = 12 kalan 4
12 ÷ 16 = 0 kalan 12 (C in hex)

Sonuç (tersten oku): C-4-8-8 = 0xC488
```

### Hex → Decimal (0xC488 → 50312)

```
0xC488 = (C × 16³) + (4 × 16²) + (8 × 16¹) + (8 × 16⁰)
      = (12 × 4096) + (4 × 256) + (8 × 16) + (8 × 1)
      = 49152 + 1024 + 128 + 8
      = 50312 ✓
```

## ❌ Önceki Hata

Ben yanlışlıkla **0xC478** yazmıştım, o da:
```
0xC478 = (12 × 4096) + (4 × 256) + (7 × 16) + (8 × 1)
      = 49152 + 1024 + 112 + 8
      = 50296 ❌
```

## 📋 Hex Karşılıkları

| Decimal | Hex |
|---------|-----|
| 0 | 0 |
| 1 | 1 |
| 2 | 2 |
| ... | ... |
| 9 | 9 |
| 10 | A |
| 11 | B |
| 12 | C |
| 13 | D |
| 14 | E |
| 15 | F |

## ✅ Güncel Dosyalar

- ✅ `src/web3/wallet.js` → `0xC488`
- ✅ `contracts/hardhat.config.js` → `50312`
- ✅ `NETWORK_INFO.md` → Güncel

## 🎯 MetaMask'ta Görülecek

```
Chain ID: 50312
Network: Somnia Shannon Testnet
RPC: https://dream-rpc.somnia.network
Symbol: STT
```

Şimdi doğru! 🚀

