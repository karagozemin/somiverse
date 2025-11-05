export default class Building {
    constructor(scene, gridX, gridY, texture, name, type) {
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.name = name;
        this.type = type; // 'swap', 'nft', 'faucet', 'staking'
        this.isNearby = false;

        // Create sprite
        const pos = this.scene.cartesianToIsometric(gridX, gridY);
        this.sprite = this.scene.add.sprite(pos.x, pos.y - 40, texture);
        this.sprite.setOrigin(0.5, 1);
        
        const depth = gridY * 100 + gridX;
        this.sprite.setDepth(depth);

        // Create interaction hint (E key)
        this.hintText = this.scene.add.text(pos.x, pos.y - 140, 'Press E', {
            font: 'bold 16px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(255, 0, 128, 0.8)',
            padding: { x: 8, y: 4 },
            borderRadius: 4
        });
        this.hintText.setOrigin(0.5);
        this.hintText.setDepth(depth + 1);
        this.hintText.setVisible(false);

        // Add pulsing animation to building
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add particle glow
        this.createGlowEffect(pos.x, pos.y - 80);
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
        this.hintText.setVisible(isNear);

        if (isNear) {
            // Scale up animation
            this.scene.tweens.add({
                targets: this.hintText,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                yoyo: true,
                repeat: -1
            });
        } else {
            this.scene.tweens.killTweensOf(this.hintText);
            this.hintText.setScale(1);
        }
    }

    interact() {
        console.log(`Interacting with ${this.name} (${this.type})`);
        
        // Flash effect
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            repeat: 2
        });

        // Open popup
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

