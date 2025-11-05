import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Here we'll load all assets
        // For now, we'll create procedural graphics
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
            
            // Hide loading screen
            document.getElementById('loading-screen').classList.add('hidden');
        });
    }

    createPlaceholderAssets() {
        // Create isometric tile (grass)
        const tileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Isometric diamond shape (2:1 ratio)
        const tileWidth = 128;
        const tileHeight = 64;
        
        tileGraphics.fillStyle(0x4ade80, 1);
        tileGraphics.beginPath();
        tileGraphics.moveTo(tileWidth / 2, 0);
        tileGraphics.lineTo(tileWidth, tileHeight / 2);
        tileGraphics.lineTo(tileWidth / 2, tileHeight);
        tileGraphics.lineTo(0, tileHeight / 2);
        tileGraphics.closePath();
        tileGraphics.fillPath();
        
        // Border
        tileGraphics.lineStyle(2, 0x22c55e, 1);
        tileGraphics.strokePath();
        
        tileGraphics.generateTexture('tile-grass', tileWidth, tileHeight);
        tileGraphics.destroy();

        // Create water tile
        const waterGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        waterGraphics.fillStyle(0x00D4FF, 1);
        waterGraphics.beginPath();
        waterGraphics.moveTo(tileWidth / 2, 0);
        waterGraphics.lineTo(tileWidth, tileHeight / 2);
        waterGraphics.lineTo(tileWidth / 2, tileHeight);
        waterGraphics.lineTo(0, tileHeight / 2);
        waterGraphics.closePath();
        waterGraphics.fillPath();
        waterGraphics.lineStyle(2, 0x0891b2, 1);
        waterGraphics.strokePath();
        waterGraphics.generateTexture('tile-water', tileWidth, tileHeight);
        waterGraphics.destroy();

        // Create path tile
        const pathGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        pathGraphics.fillStyle(0xfbbf24, 1);
        pathGraphics.beginPath();
        pathGraphics.moveTo(tileWidth / 2, 0);
        pathGraphics.lineTo(tileWidth, tileHeight / 2);
        pathGraphics.lineTo(tileWidth / 2, tileHeight);
        pathGraphics.lineTo(0, tileHeight / 2);
        pathGraphics.closePath();
        pathGraphics.fillPath();
        pathGraphics.lineStyle(2, 0xf59e0b, 1);
        pathGraphics.strokePath();
        pathGraphics.generateTexture('tile-path', tileWidth, tileHeight);
        pathGraphics.destroy();

        // Create player sprite (simple circle)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0xFF0080, 1);
        playerGraphics.fillCircle(32, 32, 24);
        playerGraphics.lineStyle(3, 0xffffff, 1);
        playerGraphics.strokeCircle(32, 32, 24);
        playerGraphics.generateTexture('player', 64, 64);
        playerGraphics.destroy();

        // Create building sprites
        this.createBuildingSprite('building-swap', 0xFF0080, 'SWAP');
        this.createBuildingSprite('building-nft', 0x8B5CF6, 'NFT');
        this.createBuildingSprite('building-faucet', 0x00D4FF, 'FAUCET');
        this.createBuildingSprite('building-staking', 0xfbbf24, 'STAKE');
    }

    createBuildingSprite(key, color, label) {
        const width = 128;
        const height = 160;
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Building body (isometric cube)
        graphics.fillStyle(color, 1);
        
        // Front face
        graphics.beginPath();
        graphics.moveTo(width / 2, height - 80);
        graphics.lineTo(width, height - 40);
        graphics.lineTo(width, height);
        graphics.lineTo(width / 2, height - 40);
        graphics.closePath();
        graphics.fillPath();
        
        // Left face (darker)
        const darkerColor = Phaser.Display.Color.IntegerToColor(color).darken(30).color;
        graphics.fillStyle(darkerColor, 1);
        graphics.beginPath();
        graphics.moveTo(width / 2, height - 80);
        graphics.lineTo(0, height - 40);
        graphics.lineTo(0, height);
        graphics.lineTo(width / 2, height - 40);
        graphics.closePath();
        graphics.fillPath();
        
        // Top face (lighter)
        const lighterColor = Phaser.Display.Color.IntegerToColor(color).lighten(20).color;
        graphics.fillStyle(lighterColor, 1);
        graphics.beginPath();
        graphics.moveTo(width / 2, height - 80);
        graphics.lineTo(width, height - 40);
        graphics.lineTo(width / 2, height - 100);
        graphics.lineTo(0, height - 40);
        graphics.closePath();
        graphics.fillPath();
        
        // Add glow effect
        graphics.lineStyle(3, 0xffffff, 0.5);
        graphics.strokeRect(width / 2 - 20, height - 70, 40, 30);
        
        graphics.generateTexture(key, width, height);
        
        // Add text label
        const text = this.make.text({
            x: width / 2,
            y: 20,
            text: label,
            style: {
                font: 'bold 14px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        }, false);
        text.setOrigin(0.5);
        
        const rt = this.make.renderTexture({ x: 0, y: 0, width, height }, false);
        rt.draw(graphics, 0, 0);
        rt.draw(text, 0, 0);
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

