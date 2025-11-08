import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Load background image (cyberpunk land)
        // Public klasöründen yükle (daha hızlı ve mantıklı!)
        this.load.image('somi-land', '/backgrounds/somi-land.png');
        
        // Custom ground - İzometrik neon grid (karakterin yürüdüğü alan)
        this.load.image('custom-ground', '/backgrounds/ground.png');
        
        // 🎮 CYBERPUNK CHARACTER SPRITESHEET
        // character.png: Siyah arka plan, 4 tam karakter alt satırda
        // Resim: 1563x1563 piksel
        // ALT SATIRDA 4 TAM KARAKTER VAR (Idle, Walk1, Walk2, Hologram)
        // Bu karakterleri manuel olarak frame'lere ayıracağız
        this.load.image('character-sheet', '/character.png');

        // 🎨 TILE GÖRSELLERİ YÜKLEME SİSTEMİ
        // Eğer public/tiles/ klasöründe görseller varsa onları yükle
        // Yoksa prosedürel tile'lar kullanılacak (fallback)
        
        // 🎨 SPRITESHEET YÜKLEME - 9 tile'lı ground sistemi
        // somi-lands.png içinde 3x3 grid = 9 farklı tile var
        this.load.spritesheet('ground-tiles', '/tiles/ground/somi-lands.png', {
            frameWidth: 130,   // Her tile 130 piksel genişlik
            frameHeight: 66    // Her tile 66 piksel yükseklik (2:1 izometrik)
        });
        
        // Eski tekli tile'lar (fallback için)
        this.load.image('tile-water-img', '/tiles/ground/water.png');
        this.load.image('tile-path-img', '/tiles/ground/path.png');
        
        // Decoration (Dekorasyon) Tiles
        this.load.image('tile-tree-img', '/tiles/decorations/tree.png');
        this.load.image('tile-stone-img', '/tiles/decorations/stone.png');
        
        // Buildings (Binalar)
        this.load.image('building-swap-img', '/tiles/buildings/swap-build.png');
        this.load.image('building-meme-img', '/tiles/buildings/meme-build.png');
        this.load.image('building-lending-img', '/tiles/buildings/lending-build.png');
        this.load.image('building-faucet-img', '/tiles/buildings/faucet.png');
        
        // Error handling - Eğer görsel yüklenemezse prosedürel kullan
        this.load.on('loaderror', (file) => {
            console.log(`Asset yüklenemedi: ${file.key}, prosedürel tile kullanılacak`);
        });

        // Here we'll create procedural graphics (fallback için)
        this.createPlaceholderAssets();
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xFF0080, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            
            // 🎬 Karakter frame'lerini manuel olarak oluştur
            this.createCharacterFrames();
            
            // Hide loading screen
            document.getElementById('loading-screen').classList.add('hidden');
        });
    }

    createCharacterFrames() {
        // character.png: Siyah arka plan, 4 tam karakter alt satırda
        // Resim: 1563x1563 piksel
        // ALT SATIRDA 4 TAM KARAKTER VAR (Idle, Walk1, Walk2, Hologram)
        // Kafanın TAMAMINI görmek için daha yukarıdan başlıyoruz
        
        if (!this.textures.exists('character-sheet')) {
            console.error('❌ character-sheet yüklenemedi!');
            return;
        }
        
        const sheet = this.textures.get('character-sheet');
        const sourceImg = sheet.getSourceImage();
        
        console.log('📏 Character sheet boyutları:', sourceImg.width, 'x', sourceImg.height);
        
        // Alt satırdaki 4 karakter (1563x1563 resim için KAFASI TAM koordinatlar)
        // Kafanın TAMAMINI görmek için daha yukarıdan başlıyoruz
        const frameConfigs = [
            // IDLE (Düz Durş) - En sol karakter
            { x: 35, y: 920, width: 330, height: 550 },
            
            // WALK 1 (Yürüyüş Adımı) - 2. karakter  
            { x: 415, y: 920, width: 330, height: 550 },
            
            // WALK 2 (Yürüü Dövüş Adımı) - 3. karakter
            { x: 795, y: 920, width: 330, height: 550 },
            
            // INTERACT (Hologram Tablet) - En sağ karakter
            { x: 1175, y: 920, width: 330, height: 550 }
        ];
        
        // Her frame'i texture'a ekle
        frameConfigs.forEach((config, index) => {
            sheet.add(
                index,           // frame index
                0,               // source index
                config.x,        
                config.y,        
                config.width,    
                config.height    
            );
        });
        
        console.log('✅ Karakter frame\'leri oluşturuldu:');
        console.log('   Frame 0: IDLE (Düz Durş) - x:' + frameConfigs[0].x);
        console.log('   Frame 1: WALK 1 (Yürüyüş) - x:' + frameConfigs[1].x);
        console.log('   Frame 2: WALK 2 (Dövüş) - x:' + frameConfigs[2].x);
        console.log('   Frame 3: INTERACT (Hologram) - x:' + frameConfigs[3].x);
    }

    createPlaceholderAssets() {
        // Isometric diamond shape (2:1 ratio)
        const tileWidth = 130;
        const tileHeight = 66;
        
        // Create professional grass tile with texture
        this.createGrassTile(tileWidth, tileHeight);
        
        // Create professional water tile
        this.createWaterTile(tileWidth, tileHeight);
        
        // Create professional path tile (stone path)
        this.createPathTile(tileWidth, tileHeight);
        
        // Create decorative elements
        this.createTreeTile(tileWidth, tileHeight);
        this.createStoneTile(tileWidth, tileHeight);

        // Create player sprite (simple circle)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0xFF0080, 1);
        playerGraphics.fillCircle(32, 32, 24);
        playerGraphics.lineStyle(3, 0xffffff, 1);
        playerGraphics.strokeCircle(32, 32, 24);
        playerGraphics.generateTexture('player', 64, 64);
        playerGraphics.destroy();

        // 🎨 CYBERPUNK BİNALAR
        this.createCyberpunkBuilding('building-swap', 0xFF0080, 'S\nW\nA\nP');
        this.createCyberpunkBuilding('building-nft', 0x8B5CF6, 'XD');
        this.createCyberpunkBuilding('building-faucet', 0xfbbf24, '$$$');
    }

    createGrassTile(width, height) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Base grass color (darker, more natural)
        const baseColor = 0x2d7a3d;
        const lightColor = 0x3d9a4d;
        const darkColor = 0x1d5a2d;
        
        // Fill base
        graphics.fillStyle(baseColor, 1);
        graphics.beginPath();
        graphics.moveTo(width / 2, 0);
        graphics.lineTo(width, height / 2);
        graphics.lineTo(width / 2, height);
        graphics.lineTo(0, height / 2);
        graphics.closePath();
        graphics.fillPath();
        
        // Add texture with random grass patches
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 3 + Math.random() * 4;
            graphics.fillStyle(lightColor, 0.4 + Math.random() * 0.3);
            graphics.fillCircle(x, y, size);
        }
        
        // Darker patches for depth
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 2 + Math.random() * 3;
            graphics.fillStyle(darkColor, 0.3);
            graphics.fillCircle(x, y, size);
        }
        
        graphics.generateTexture('tile-grass', width, height);
        graphics.destroy();
    }
    
    createWaterTile(width, height) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Somnia pink colors - çok çırtlak olmasın çok da koyu olmasın
        const baseColor = 0x8B3A6B; // Orta ton pembe (koyu pembe)
        const lightColor = 0xB84D8F; // Açık pembe
        
        // Base water (pembe)
        graphics.fillStyle(baseColor, 1);
        graphics.beginPath();
        graphics.moveTo(width / 2, 0);
        graphics.lineTo(width, height / 2);
        graphics.lineTo(width / 2, height);
        graphics.lineTo(0, height / 2);
        graphics.closePath();
        graphics.fillPath();
        
        // Water waves/ripples (pembe tonlar)
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 4 + Math.random() * 6;
            graphics.fillStyle(lightColor, 0.3);
            graphics.fillEllipse(x, y, size, size / 2);
        }
        
        graphics.generateTexture('tile-water', width, height);
        graphics.destroy();
    }
    
    createPathTile(width, height) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Professional stone path colors (warm brown/gray)
        const baseColor = 0x8b7355;
        const lightColor = 0xa5937d;
        const darkColor = 0x6b5d45;
        
        // Base path
        graphics.fillStyle(baseColor, 1);
        graphics.beginPath();
        graphics.moveTo(width / 2, 0);
        graphics.lineTo(width, height / 2);
        graphics.lineTo(width / 2, height);
        graphics.lineTo(0, height / 2);
        graphics.closePath();
        graphics.fillPath();
        
        // Stone texture - individual stones (rounded rectangles)
        const stoneSize = 8;
        for (let x = 5; x < width - 5; x += stoneSize + 2) {
            for (let y = 5; y < height - 5; y += stoneSize / 2 + 1) {
                const offsetX = (Math.random() - 0.5) * 2;
                const offsetY = (Math.random() - 0.5) * 2;
                const stoneColor = Math.random() > 0.5 ? lightColor : darkColor;
                graphics.fillStyle(stoneColor, 0.7);
                // Use regular rect with rounded corners manually
                graphics.fillRect(x + offsetX, y + offsetY, stoneSize, stoneSize / 2);
                // Add rounded corners effect with small circles
                graphics.fillStyle(baseColor, 0.3);
                graphics.fillCircle(x + offsetX, y + offsetY, 1);
                graphics.fillCircle(x + offsetX + stoneSize, y + offsetY, 1);
                graphics.fillCircle(x + offsetX, y + offsetY + stoneSize / 2, 1);
                graphics.fillCircle(x + offsetX + stoneSize, y + offsetY + stoneSize / 2, 1);
            }
        }
        
        graphics.generateTexture('tile-path', width, height);
        graphics.destroy();
    }
    
    createTreeTile(width, height) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Tree trunk
        graphics.fillStyle(0x5d4037, 1);
        graphics.fillRect(width / 2 - 3, height / 2 + 5, 6, 12);
        
        // Tree leaves (multiple layers)
        graphics.fillStyle(0x2d5016, 0.8);
        graphics.fillCircle(width / 2 - 8, height / 2 - 5, 8);
        graphics.fillCircle(width / 2 + 8, height / 2 - 5, 8);
        graphics.fillCircle(width / 2, height / 2 - 10, 10);
        
        graphics.fillStyle(0x3d7026, 0.6);
        graphics.fillCircle(width / 2, height / 2 - 8, 12);
        
        graphics.generateTexture('tile-tree', width, height);
        graphics.destroy();
    }
    
    createStoneTile(width, height) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Base grass (same as grass tile)
        graphics.fillStyle(0x2d7a3d, 1);
        graphics.beginPath();
        graphics.moveTo(width / 2, 0);
        graphics.lineTo(width, height / 2);
        graphics.lineTo(width / 2, height);
        graphics.lineTo(0, height / 2);
        graphics.closePath();
        graphics.fillPath();
        
        // Stone/rock
        graphics.fillStyle(0x6b6b6b, 0.9);
        graphics.fillEllipse(width / 2, height / 2, 12, 8);
        graphics.fillStyle(0x4b4b4b, 0.7);
        graphics.fillEllipse(width / 2 - 2, height / 2 - 2, 8, 6);
        
        graphics.generateTexture('tile-stone', width, height);
        graphics.destroy();
    }

    createCyberpunkBuilding(key, color, text) {
        const width = 120;
        const height = 150;
        
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Bina gövdesi (silindir/yuvarlak)
        graphics.fillStyle(color, 0.9);
        graphics.fillRoundedRect(20, 20, 80, 110, 15);
        
        // Neon kenarlık
        graphics.lineStyle(3, color, 1);
        graphics.strokeRoundedRect(20, 20, 80, 110, 15);
        
        // Üst platform
        graphics.fillStyle(color, 0.7);
        graphics.fillEllipse(60, 20, 60, 20);
        
        // Pencereler (neon)
        for (let i = 0; i < 3; i++) {
            graphics.fillStyle(0xFFFFFF, 0.3);
            graphics.fillRect(35, 50 + i * 25, 15, 15);
            graphics.fillRect(70, 50 + i * 25, 15, 15);
        }
        
        graphics.generateTexture(key, width, height);
        
        // Text overlay
        const textGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        const style = {
            font: text.length > 2 ? 'bold 32px Arial' : 'bold 48px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        };
        
        const textObj = this.make.text({
            x: width / 2,
            y: height / 2,
            text: text,
            style: style
        }, false);
        textObj.setOrigin(0.5, 0.5);
        
        const rt = this.make.renderTexture({ x: 0, y: 0, width, height }, false);
        rt.draw(graphics, 0, 0);
        rt.draw(textObj, 0, 0);
        rt.saveTexture(key);
        rt.destroy();
        
        graphics.destroy();
        textObj.destroy();
    }

    createSimpleBuildingMarker(key, color, icon) {
        const width = 80;
        const height = 80;
        
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Simple circle with color
        graphics.fillStyle(color, 0.8);
        graphics.fillCircle(width / 2, height / 2, 35);
        
        // No border - clean circle
        graphics.generateTexture(key, width, height);
        
        // Create icon text
        const text = this.make.text({
            x: width / 2,
            y: height / 2,
            text: icon,
            style: {
                font: 'bold 32px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        }, false);
        text.setOrigin(0.5, 0.5);
        
        // Combine
        const rt = this.make.renderTexture({ x: 0, y: 0, width, height }, false);
        rt.draw(graphics, 0, 0);
        rt.draw(text, 0, 0);
        rt.saveTexture(key);
        rt.destroy();
        
        graphics.destroy();
        text.destroy();
    }

    createDetailedBuilding(key, color, label) {
        const width = 300;
        const height = 400;
        const buildingHeight = 180;
        const baseWidth = 250;
        const baseHeight = 120;
        
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Building base (larger isometric diamond)
        graphics.fillStyle(color, 0.9);
        graphics.beginPath();
        graphics.moveTo(baseWidth / 2, height - baseHeight);
        graphics.lineTo(baseWidth, height - baseHeight / 2);
        graphics.lineTo(baseWidth / 2, height);
        graphics.lineTo(0, height - baseHeight / 2);
        graphics.closePath();
        graphics.fillPath();
        
        // Base outline
        graphics.lineStyle(3, color, 1);
        graphics.strokePath();
        
        // Left face (darker)
        const darkerColor = Phaser.Display.Color.IntegerToColor(color).darken(20).color;
        graphics.fillStyle(darkerColor, 0.9);
        graphics.beginPath();
        graphics.moveTo(baseWidth / 2, height - baseHeight - buildingHeight);
        graphics.lineTo(0, height - baseHeight / 2 - buildingHeight / 2);
        graphics.lineTo(0, height - baseHeight / 2);
        graphics.lineTo(baseWidth / 2, height - baseHeight);
        graphics.closePath();
        graphics.fillPath();
        graphics.lineStyle(3, darkerColor, 1);
        graphics.strokePath();
        
        // Right face (lighter)
        const lighterColor = Phaser.Display.Color.IntegerToColor(color).lighten(20).color;
        graphics.fillStyle(lighterColor, 0.9);
        graphics.beginPath();
        graphics.moveTo(baseWidth / 2, height - baseHeight - buildingHeight);
        graphics.lineTo(baseWidth, height - baseHeight / 2 - buildingHeight / 2);
        graphics.lineTo(baseWidth, height - baseHeight / 2);
        graphics.lineTo(baseWidth / 2, height - baseHeight);
        graphics.closePath();
        graphics.fillPath();
        graphics.lineStyle(3, lighterColor, 1);
        graphics.strokePath();
        
        // Top face (roof)
        const topColor = Phaser.Display.Color.IntegerToColor(color).lighten(35).color;
        graphics.fillStyle(topColor, 0.9);
        graphics.beginPath();
        graphics.moveTo(baseWidth / 2, height - baseHeight - buildingHeight);
        graphics.lineTo(baseWidth, height - baseHeight / 2 - buildingHeight / 2);
        graphics.lineTo(baseWidth / 2, height - baseHeight - buildingHeight - 30);
        graphics.lineTo(0, height - baseHeight / 2 - buildingHeight / 2);
        graphics.closePath();
        graphics.fillPath();
        graphics.lineStyle(3, topColor, 1);
        graphics.strokePath();
        
        // Add windows (multiple rows)
        graphics.fillStyle(0xffffff, 0.4);
        const windowWidth = 25;
        const windowHeight = 35;
        const windowSpacing = 40;
        
        // Left side windows
        for (let i = 0; i < 3; i++) {
            const yPos = height - baseHeight - 60 - (i * windowSpacing);
            graphics.fillRect(baseWidth / 2 - 60, yPos, windowWidth, windowHeight);
        }
        
        // Right side windows
        for (let i = 0; i < 3; i++) {
            const yPos = height - baseHeight - 60 - (i * windowSpacing);
            graphics.fillRect(baseWidth / 2 + 35, yPos, windowWidth, windowHeight);
        }
        
        // Front door
        graphics.fillStyle(0xffffff, 0.5);
        graphics.fillRect(baseWidth / 2 - 20, height - baseHeight - 20, 40, 50);
        
        // Create render texture
        const rt = this.make.renderTexture({ x: 0, y: 0, width, height }, false);
        rt.draw(graphics, 0, 0);
        
        // Create HUGE text label above building
        const text = this.make.text({
            x: width / 2,
            y: height - baseHeight - buildingHeight - 100,
            text: label,
            style: {
                font: 'bold 48px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 10,
                shadow: {
                    offsetX: 4,
                    offsetY: 4,
                    color: '#000000',
                    blur: 8,
                    stroke: true,
                    fill: true
                }
            }
        }, false);
        text.setOrigin(0.5, 0.5);
        
        // Draw text to render texture
        rt.draw(text, 0, 0);
        
        // Save as texture
        rt.saveTexture(key);
        rt.destroy();
        
        graphics.destroy();
        text.destroy();
    }

    create() {
        // Start main scene
        this.scene.start('MainScene');
        this.scene.start('UIScene');
    }
}

