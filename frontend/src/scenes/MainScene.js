import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Building from '../entities/Building.js';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Isometric grid settings (updated to match new tile size)
        this.tileWidth = 130;
        this.tileHeight = 66;
        this.gridWidth = 25;  // Orta boyut (20'den 25'e)
        this.gridHeight = 25; // Orta boyut (20'den 25'e)

        // BACKGROUND IMAGE - Tüm ekranı kapsayan cyberpunk land
        const worldWidth = 4000;  // Küçük boyut dünya (5000'den 4000'e)
        const worldHeight = 4000; // Küçük boyut dünya (5000'den 4000'e)
        
        // Background kaldırıldı - Sadece grid alanı görünsün, geri kalan siyah olacak
        // if (this.textures.exists('somi-land')) {
        //     this.background = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'somi-land');
        //     this.background.setOrigin(0.5, 0.5);
        //     this.background.setDepth(-100); // En arkada
        //     this.background.setAlpha(1); // Tam görünür
        //     this.background.setScrollFactor(0.5); // Parallax efekti
        // }

        // 🎯 CUSTOM GROUND - Prosedürel haritanın ÜSTÜNde overlay
        if (this.textures.exists('custom-ground')) {
            this.customGround = this.add.image(0, 0, 'custom-ground');
            this.customGround.setOrigin(0.5, 0.5);
            this.customGround.setDepth(10); // Prosedürel tile'ların üstünde, player'ın altında
            this.customGround.setScale(2.8); // Oyun alanına sığacak boyut
            this.customGround.setAlpha(0.6); // Yarı şeffaf - alttaki tile'lar da gözüksün
            this.customGround.setBlendMode(Phaser.BlendModes.ADD); // Neon glow efekti
            this.customGround.setScrollFactor(1); // Kamera ile hareket eder
            
            console.log('✅ Custom Ground overlay aktif!');
        }

        // Camera setup - ÇOK GENİŞ ALAN
        this.cameras.main.setBounds(-worldWidth/2, -worldHeight/2, worldWidth, worldHeight);
        this.cameras.main.setZoom(0.85); // Optimal zoom level

        // Create the isometric world
        this.createIsometricWorld();

        // Create buildings
        this.buildings = [];
        this.createBuildings();

        // Create player at center (ortada başlasın - 25x25 grid'in ortası)
        this.player = new Player(this, 12, 12);
        
        // Camera follows player
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };

        // Store reference for other scenes
        this.registry.set('mainScene', this);
    }

    // 🎨 Cyberpunk land tasarımı - Yol sistemini belirle
    isNeonRoad(x, y) {
        // Ana çarpı yolları (merkez 12,12)
        const centerX = 12;
        const centerY = 12;
        
        // Yatay yollar (her 8 tile'da bir)
        if (y % 8 === 0) return true;
        
        // Dikey yollar (her 8 tile'da bir)
        if (x % 8 === 0) return true;
        
        // Merkez çember yolu
        const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distToCenter > 8 && distToCenter < 10) return true;
        
        return false;
    }
    
    // 🎨 Kristal pozisyonları
    isCrystal(x, y) {
        // Rastgele kristaller (düşük oran)
        const hash = (x * 73856093) ^ (y * 19349663);
        return (hash % 100) < 3; // %3 şans
    }

    // 🎨 Helper: Gerçek görsel varsa onu kullan, yoksa prosedürel tile kullan
    getActualTileKey(tileType) {
        // Mapping: prosedürel tile → gerçek görsel
        const tileMapping = {
            'tile-grass': 'tile-grass-img',
            'tile-water': 'tile-water-img',
            'tile-path': 'tile-path-img',
            'tile-tree': 'tile-tree-img',
            'tile-stone': 'tile-stone-img'
        };
        
        const imageKey = tileMapping[tileType];
        
        // Eğer gerçek görsel yüklendiyse onu kullan
        if (imageKey && this.textures.exists(imageKey)) {
            return imageKey;
        }
        
        // Yoksa prosedürel tile kullan (fallback)
        return tileType;
    }

    // 🎨 Basit tile oluştur (graphics ile, texture yok)
    createGroundTile(x, y) {
        const graphics = this.add.graphics();
        
        // Koyu mor/siyah izometrik tile
        graphics.fillStyle(0x1a0b2e, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - 33);
        graphics.lineTo(x + 65, y);
        graphics.lineTo(x, y + 33);
        graphics.lineTo(x - 65, y);
        graphics.closePath();
        graphics.fillPath();
        
        // Hafif kenarlık
        graphics.lineStyle(1, 0x2d1b4e, 0.3);
        graphics.strokePath();
        
        return graphics;
    }
    
    // 💜 Neon yol tile
    createNeonRoad(x, y) {
        const graphics = this.add.graphics();
        
        // Mor yol
        graphics.fillStyle(0x8B5CF6, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - 33);
        graphics.lineTo(x + 65, y);
        graphics.lineTo(x, y + 33);
        graphics.lineTo(x - 65, y);
        graphics.closePath();
        graphics.fillPath();
        
        // Pembe kenarlık
        graphics.lineStyle(2, 0xFF0080, 1);
        graphics.strokePath();
        
        return graphics;
    }
    
    // 💎 Kristal
    createCrystal(x, y, depth) {
        const graphics = this.add.graphics();
        
        // Cyan kristal
        graphics.fillStyle(0x00D4FF, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - 20);
        graphics.lineTo(x + 10, y);
        graphics.lineTo(x, y + 5);
        graphics.lineTo(x - 10, y);
        graphics.closePath();
        graphics.fillPath();
        
        // Parlak kenarlık
        graphics.lineStyle(2, 0x00FFFF, 1);
        graphics.strokePath();
        
        graphics.setDepth(depth);
        
        // Parıldama
        this.tweens.add({
            targets: graphics,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return graphics;
    }

    createIsometricWorld() {
        this.tiles = [];
        
        console.log('🎨 Cyberpunk land oluşturuluyor...');
        
        // Calculate offset to center the map - TAM EKRAN için dinamik
        const offsetX = this.cameras.main.width / 2;
        const offsetY = this.cameras.main.height / 2;
        
        // 🎨 CYBERPUNK LAND - Yeni tasarım
        for (let y = 0; y < this.gridHeight; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                const isoPos = this.cartesianToIsometric(x, y);
                let tile;
                let tileType = 'ground';
                
                // 💜 NEON YOL MU?
                if (this.isNeonRoad(x, y)) {
                    tile = this.createNeonRoad(isoPos.x + offsetX, isoPos.y + offsetY);
                    tileType = 'neon-road';
                }
                // 💎 KRİSTAL Mİ?
                else if (this.isCrystal(x, y)) {
                    tile = this.createGroundTile(isoPos.x + offsetX, isoPos.y + offsetY);
                    this.createCrystal(isoPos.x + offsetX, isoPos.y + offsetY - 30, y * 100 + x + 10);
                    tileType = 'crystal';
                }
                // 🟣 NORMAL ZEMİN
                else {
                    tile = this.createGroundTile(isoPos.x + offsetX, isoPos.y + offsetY);
                }
                
                // Depth ayarla (graphics için)
                tile.setDepth(y * 100 + x);
                
                this.tiles[y][x] = {
                    sprite: tile,
                    type: tileType,
                    gridX: x,
                    gridY: y
                };
            }
        }
    }

    createBuildings() {
        // 3 ANA BİNA - Orta boyut alanda dağıtıldı (oyuncu 12,12'de başlıyor)
        
        // 💱 SWAP BİNASI - Sol üst bölge
        // Gerçek görsel varsa kullan: building-swap-img, yoksa: building-swap
        const swapTexture = this.textures.exists('building-swap-img') ? 'building-swap-img' : 'building-swap';
        this.buildings.push(new Building(this, 6, 6, swapTexture, 'Swap City', 'swap'));
        
        // 😂 MEME BİNASI - Sağ üst bölge
        const memeTexture = this.textures.exists('building-meme-img') ? 'building-meme-img' : 'building-nft';
        this.buildings.push(new Building(this, 18, 6, memeTexture, 'Meme Gallery', 'nft'));
        
        // 💰 LENDING BİNASI - Alt ortada
        const lendingTexture = this.textures.exists('building-lending-img') ? 'building-lending-img' : 'building-faucet';
        this.buildings.push(new Building(this, 12, 18, lendingTexture, 'Lending Tower', 'faucet'));
        
        // NOT: Staking binasını kaldırdık, 3 bina olacak dediklerinde
        // İsterseniz tekrar ekleyebiliriz
    }

    update() {
        if (!this.player) return;

        // Player movement
        let moveX = 0;
        let moveY = 0;

        if (this.keys.W.isDown || this.cursors.up.isDown) {
            moveY = -1;
        } else if (this.keys.S.isDown || this.cursors.down.isDown) {
            moveY = 1;
        }

        if (this.keys.A.isDown || this.cursors.left.isDown) {
            moveX = -1;
        } else if (this.keys.D.isDown || this.cursors.right.isDown) {
            moveX = 1;
        }

        if (moveX !== 0 || moveY !== 0) {
            this.player.move(moveX, moveY);
        }

        // Check proximity to buildings (auto-open on close)
        this.checkBuildingProximity();
    }

    checkBuildingInteraction() {
        const playerGridPos = this.player.getGridPosition();
        
        this.buildings.forEach(building => {
            const distance = Phaser.Math.Distance.Between(
                playerGridPos.x, playerGridPos.y,
                building.gridX, building.gridY
            );
            
            if (distance < 2) {
                building.interact();
            }
        });
    }

    checkBuildingProximity() {
        const playerGridPos = this.player.getGridPosition();
        
        this.buildings.forEach(building => {
            const distance = Phaser.Math.Distance.Between(
                playerGridPos.x, playerGridPos.y,
                building.gridX, building.gridY
            );
            
            const isNear = distance < 2;
            building.setProximity(isNear);
            
            // Auto-open popup when close (no need to press E)
            if (isNear && !building.popupOpened) {
                building.popupOpened = true;
                building.interact();
            } else if (!isNear) {
                building.popupOpened = false;
            }
        });
    }

    // Coordinate conversion utilities
    cartesianToIsometric(cartX, cartY) {
        const isoX = (cartX - cartY) * (this.tileWidth / 2);
        const isoY = (cartX + cartY) * (this.tileHeight / 2);
        
        return {
            x: isoX,
            y: isoY
        };
    }

    isometricToCartesian(isoX, isoY) {
        const cartX = (isoX / (this.tileWidth / 2) + isoY / (this.tileHeight / 2)) / 2;
        const cartY = (isoY / (this.tileHeight / 2) - isoX / (this.tileWidth / 2)) / 2;
        
        return { x: Math.round(cartX), y: Math.round(cartY) };
    }
}

