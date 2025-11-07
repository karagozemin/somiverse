# Debug Checklist - Connect Wallet Sorunu

## ✅ Kontrol Listesi

### 1. **MetaMask Yüklü mü?**
```
Chrome/Brave: Extensions → MetaMask görünüyor mu?
```

### 2. **Console'da Hata Var mı?**
```
F12 → Console tab
Red hatalar var mı kontrol et
```

### 3. **Butona Tıklanıyor mu?**
```
F12 → Console
"Wallet button initialized" yazısı var mı?
Butona tıklayınca MetaMask açılıyor mu?
```

### 4. **Network Sorunu**
```
F12 → Network tab
Dosyalar yükleniyor mu?
main.js, wallet.js yüklendi mi?
```

## 🔧 Manuel Test

### Tarayıcı Console'da Çalıştır:

```javascript
// 1. MetaMask var mı?
console.log('MetaMask:', window.ethereum ? 'Yüklü ✅' : 'Yüklü Değil ❌');

// 2. Buton var mı?
console.log('Button:', document.getElementById('connect-wallet'));

// 3. Manuel connect dene
if (window.ethereum) {
    window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => console.log('Accounts:', accounts))
        .catch(err => console.error('Error:', err));
}
```

## 🐛 Sık Sorunlar

### Sorun 1: MetaMask Açılmıyor
**Çözüm:**
```
1. MetaMask extension'ı yüklü mü kontrol et
2. MetaMask'ın sitene izin verip vermediğini kontrol et
3. MetaMask'ı kilitle/aç yap
4. Tarayıcıyı restart et
```

### Sorun 2: "User Rejected" Hatası
**Çözüm:**
```
MetaMask popup'ını reddetmedin değil mi?
Tekrar dene ve "Connect" butonuna tıkla
```

### Sorun 3: Buton Çalışmıyor
**Çözüm:**
```
1. Sayfayı yenile (Ctrl + F5 - hard refresh)
2. Console'da "Wallet button initialized" var mı kontrol et
3. Yoksa: npm run dev ile sunucuyu restart et
```

### Sorun 4: Wrong Network
**Çözüm:**
```
MetaMask'ta network'ü Somnia Shannon Testnet'e değiştir
Chain ID: 50312
```

## 🚀 Hızlı Fix

Eğer hala çalışmıyorsa:

```bash
# Terminal'de:
cd "/Users/eminkaragoz/Desktop/copy projects/somnia"

# Sunucuyu durdur (Ctrl+C)
# Tekrar başlat
npm run dev

# Tarayıcıda hard refresh
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

## 📱 Test Adımları

1. **http://localhost:3000** aç
2. **F12** → Console aç
3. **"Connect Wallet"** butonuna tıkla
4. **Console'da ne yazıyor?**
   - "Connecting to wallet..." → İyi, devam ediyor
   - "MetaMask not found" → MetaMask yükle
   - Hiçbir şey yazmıyor → Butona event listener eklenmemiş
   - Error → Hatayı bana söyle

## 💡 Beklenen Davranış

**Doğru Çalışırsa:**
1. Butona tıkla
2. Console: "Connecting to wallet..."
3. MetaMask popup açılır
4. "Connect" → onay ver
5. Toast notification: "Wallet connected successfully!"
6. Sağ üstte wallet adresi görünür
7. Points counter görünür

## 🔍 Debug Komutları

Tarayıcı console'da:

```javascript
// Wallet manager'ı test et
import('/src/web3/wallet.js').then(m => {
    window.testWallet = m.default;
    console.log('Wallet manager loaded:', window.testWallet);
    window.testWallet.connectWallet();
});
```

## 📝 Bana Söyle

Eğer hala çalışmıyorsa bana şunları söyle:
1. Console'daki hatalar (screenshot)
2. MetaMask yüklü mü?
3. "Wallet button initialized" yazıyor mu console'da?
4. Butona tıklayınca ne oluyor?
5. MetaMask popup açılıyor mu?

