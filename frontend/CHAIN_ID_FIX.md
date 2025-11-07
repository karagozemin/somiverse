# Chain ID Düzeltmesi

## 🔍 Sorun

Somnia docs'unda **Chain ID: 50312** yazıyor  
Ama RPC gerçekte **Chain ID: 50296** döndürüyor

MetaMask RPC'den chain ID'yi otomatik okuyor, bu yüzden 50296 gösteriyor.

## ✅ Çözüm

**Gerçek RPC'nin döndüğü değeri kullanmalıyız: 50296**

### Değiştirilen Dosyalar:

1. **src/web3/wallet.js**
   - Chain ID: `0xC478` (50296)
   - Comment güncellendi

2. **contracts/hardhat.config.js**
   - Chain ID: `50296`

3. **NETWORK_INFO.md**
   - Gerçek chain ID: 50296
   - Docs vs RPC farkı not edildi

## 📊 Chain ID Dönüşüm

```
Decimal: 50296
Hex: 0xC478

Hesaplama:
0xC478 = (12 × 16³) + (4 × 16²) + (7 × 16¹) + (8 × 16⁰)
      = 49152 + 1024 + 112 + 8
      = 50296
```

## ⚠️ Docs vs Gerçeklik

| Kaynak | Chain ID |
|--------|----------|
| **Somnia Docs** | 50312 |
| **RPC Response** | 50296 ✅ (Gerçek) |
| **MetaMask** | 50296 ✅ (RPC'den alıyor) |
| **Bizim Kod** | 50296 ✅ (Düzeltildi) |

## 🎯 Sonuç

Artık MetaMask'ın gösterdiği değerler kodumuzla tamamen eşleşiyor:

✅ Chain ID: **50296**  
✅ Hex: **0xC478**  
✅ Network: **Somnia Shannon Testnet**  
✅ RPC: **https://dream-rpc.somnia.network**  
✅ Explorer: **https://shannon-explorer.somnia.network/**  
✅ Symbol: **STT**  

## 💡 Not

Somnia docs'undaki 50312 muhtemelen:
- Eski bir değer
- Planlanan bir değer
- Typo

Gerçek network'te RPC'nin döndüğü **50296** doğru olanıdır.

## 🚀 Şimdi Ne Yapmalısın?

1. **Sayfayı Hard Refresh Et** (Cmd/Ctrl + Shift + R)
2. **"Connect Wallet"** butonuna tıkla
3. MetaMask açılınca **bilgileri kontrol et**:
   - Chain ID: 50296 ✅
   - Her şey eşleşiyor ✅
4. **"Approve"** → Network eklenecek
5. **Wallet bağlanacak!** 🎉

