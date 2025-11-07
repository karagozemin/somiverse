# 🎨 SomiVerse Tile Asset Rehberi

## 📁 Dosya Yapısı

```
public/tiles/
├── ground/          # Zemin tile'ları (grass, path, water)
├── decorations/     # Dekoratif elemanlar (tree, stone, neon signs)
└── buildings/       # Bina görselleri (swap, meme, lending)
```

---

## 🎯 TILE GÖRSELLERİNİ BURAYA KOY:

### **1. GROUND (Zemin) Tile'ları**
📁 Konum: `public/tiles/ground/`

#### **Gerekli Görseller:**
- ✅ `grass.png` - Cyberpunk çim/zemin tile (130x66 piksel - izometrik)
- ✅ `water.png` - Neon pembe su tile
- ✅ `path.png` - Neon taşlı yol tile

**Önerilen Boyut:** 130x66 piksel (2:1 izometrik diamond)

---

### **2. DECORATIONS (Dekoratif) Elemanlar**
📁 Konum: `public/tiles/decorations/`

#### **Gerekli Görseller:**
- ✅ `tree.png` - Cyberpunk ağaç/bitki
- ✅ `stone.png` - Neon taş/kaya
- ✅ `lamp.png` - Sokak lambası (neon) [OPSIYONEL]
- ✅ `graffiti.png` - Neon graffiti [OPSIYONEL]
- ✅ `crate.png` - Cyberpunk kutu [OPSIYONEL]

**Önerilen Boyut:** Değişken (ama 130x66 base'e uygun)

---

### **3. BUILDINGS (Binalar)**
📁 Konum: `public/tiles/buildings/`

#### **Gerekli Görseller:**
- ✅ `swap-building.png` - Swap binası (futuristik)
- ✅ `meme-building.png` - Meme binası (neon yüzler, XD)
- ✅ `lending-building.png` - Lending binası (dolar sembolleri)

**Önerilen Boyut:** 200x300 piksel (daha büyük, göze çarpan)

---

## 🎨 TASARIM KURALLARI

### **İzometrik Diamond (2:1 Ratio)**
```
Width:Height = 2:1
Örnek: 130x65, 260x130, 100x50
```

### **Cyberpunk Neon Tema:**
- 🟣 Mor neonlar
- 🩷 Pembe ışıklar
- 💙 Cyan detaylar
- ⚫ Koyu arka plan
- ✨ Glow efektleri

### **Transparency:**
- PNG formatı (alpha channel)
- Kenarlar keskin olmalı
- Glow efektleri için soft edges

---

## 📝 DOSYA ADLANDIRMA

**✅ DOĞRU:**
- `grass.png`
- `neon-tree.png`
- `swap-building.png`

**❌ YANLIŞ:**
- `Grass.PNG` (büyük harf)
- `tile_grass.png` (underscore)
- `grass tile.png` (boşluk)

---

## 🚀 KOD ENTEGRASYONU

Görseller eklendikten sonra otomatik yüklenecek!

### **Phaser'da Yükleme:**
```javascript
// BootScene.js içinde
this.load.image('tile-grass', '/tiles/ground/grass.png');
this.load.image('tile-water', '/tiles/ground/water.png');
this.load.image('tile-path', '/tiles/ground/path.png');
this.load.image('tile-tree', '/tiles/decorations/tree.png');
this.load.image('tile-stone', '/tiles/decorations/stone.png');
```

### **Kullanım:**
```javascript
// MainScene.js içinde
const tile = this.add.image(x, y, 'tile-grass');
```

---

## 📊 ÖNCELİK SIRASI

1. **Ground Tiles** (ZORUNLU)
   - ✅ grass.png
   - ✅ water.png
   - ✅ path.png

2. **Buildings** (ÖNEMLİ)
   - ✅ swap-building.png
   - ✅ meme-building.png
   - ✅ lending-building.png

3. **Decorations** (OPSIYONEL)
   - tree.png
   - stone.png
   - lamp.png
   - graffiti.png

---

## 🎯 HIZLI BAŞLANGIÇ

1. **Görselleri hazırla** (Photoshop, Figma, Aseprite, etc.)
2. **Uygun klasöre koy:**
   - Zemin → `public/tiles/ground/`
   - Dekorasyon → `public/tiles/decorations/`
   - Bina → `public/tiles/buildings/`
3. **Test et:** `npm run dev`
4. **Kodda yükle** (eğer yeni tile eklersen)

---

## 💡 ÖRNEKLER

### **Grass Tile (Cyberpunk):**
- Koyu yeşil/siyah zemin
- Mor neon çizgiler
- Hafif glow
- 130x66 piksel

### **Swap Building:**
- Futuristik yapı
- Neon pembe ışıklar
- "SWAP" neon yazısı
- Cam pencereler
- 200x300 piksel

### **Meme Building:**
- Neşeli renkler
- XD yüz neonları
- Gülen emoji tabelalar
- Renkli ışıklar
- 200x300 piksel

---

## 🔧 TEKNİK DETAYLAR

- **Format:** PNG (alpha channel)
- **Color Mode:** RGBA
- **Resolution:** 72 DPI (web için yeterli)
- **Compression:** Orta (görsel kalitesi için)
- **Max File Size:** 500KB per tile (önerilen)

---

## ❓ SORUN GİDERME

**Görsel yüklenmiyor?**
- Dosya adını kontrol et (küçük harf)
- Dosya yolunu kontrol et
- Console'da hata var mı bak
- Cache'i temizle (Ctrl+F5)

**Görsel bulanık?**
- Boyutu doğru mu kontrol et
- Pixel art için `pixelArt: true` ayarla
- Antialias ayarlarını kontrol et

**Pozisyon yanlış?**
- Origin noktasını kontrol et (0.5, 0.5)
- İzometrik koordinatları kontrol et
- Depth sıralamasını kontrol et

---

**Görselleri hazırla ve koy, ben kodu güncelleyeceğim!** 🚀


