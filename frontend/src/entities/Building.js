export default class Building {
    constructor(scene, gridX, gridY, texture, name, type) {
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.name = name;
        this.type = type; // 'swap', 'nft', 'faucet', 'staking'
        this.isNearby = false;
        this.popupOpened = false; // Track if popup is already open

        // Calculate offset - TAM EKRAN için dinamik
        const offsetX = this.scene.cameras.main.width / 2;
        const offsetY = this.scene.cameras.main.height / 2;

        // Create simple sprite marker
        const pos = this.scene.cartesianToIsometric(gridX, gridY);
        this.sprite = this.scene.add.sprite(pos.x + offsetX, pos.y + offsetY, texture);
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.setScale(0.35); // Daha da küçültüldü: 0.5 → 0.35
        this.sprite.setBlendMode(Phaser.BlendModes.NORMAL); // Şeffaflık için blend mode
        
        // Higher depth to appear above tiles
        const depth = gridY * 100 + gridX + 1000;
        this.sprite.setDepth(depth);

        // Simple label above marker
        this.hintText = this.scene.add.text(pos.x + offsetX, pos.y + offsetY - 80, this.name, {
            font: 'bold 14px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 6, y: 4 },
            borderRadius: 4
        });
        this.hintText.setOrigin(0.5);
        this.hintText.setDepth(depth + 10);
        this.hintText.setVisible(true);

        // Animasyon kaldırıldı - Custom görsel hareketsiz duracak

        // Simple glow effect
        this.createGlowEffect(pos.x + offsetX, pos.y + offsetY);
    }

    createGlowEffect(x, y) {
        // Color based on building type
        const colors = {
            'swap': 0xFF0080,
            'nft': 0x8B5CF6,
            'faucet': 0x00D4FF,
            'staking': 0xfbbf24
        };

        const color = colors[this.type] || 0xFFFFFF;

        // Create a subtle glow circle
        this.glow = this.scene.add.circle(x, y, 50, color, 0.2);
        this.glow.setDepth(this.sprite.depth - 1);

        this.scene.tweens.add({
            targets: this.glow,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.05,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }

    setProximity(isNear) {
        if (this.isNearby === isNear) return;
        
        this.isNearby = isNear;
        
        // Scale up when near - 0.35 bazlı (custom görsel için)
        if (isNear) {
            this.scene.tweens.add({
                targets: this.sprite,
                scaleX: 0.40, // Hafif büyüme: 0.35 → 0.40
                scaleY: 0.40,
                duration: 200,
                ease: 'Back.easeOut'
            });
        } else {
            this.scene.tweens.add({
                targets: this.sprite,
                scaleX: 0.35, // Normal boyut
                scaleY: 0.35,
                duration: 200,
                ease: 'Back.easeOut'
            });
        }
    }

    interact() {
        console.log(`Interacting with ${this.name} (${this.type})`);
        
        // Open popup directly (no flash effect needed for auto-open)
        this.openPopup();
    }

    openPopup() {
        // Get popup manager from web3 module
        import('../ui/popups/PopupManager.js').then(module => {
            const PopupManager = module.default;
            PopupManager.openPopup(this.type, this.name);
        });
    }
}

