export default class Player {
    constructor(scene, gridX, gridY) {
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.speed = 0.1;
        this.isMoving = false;
        this.currentDirection = 'idle';

        // Calculate offset - TAM EKRAN için dinamik
        const offsetX = this.scene.cameras.main.width / 2;
        const offsetY = this.scene.cameras.main.height / 2;

        // 🎮 Create cyberpunk character sprite
        const pos = this.scene.cartesianToIsometric(gridX, gridY);
        this.sprite = this.scene.add.sprite(pos.x + offsetX, pos.y + offsetY - 30, 'cyberpunk-char');
        this.sprite.setOrigin(0.5, 0.75); // Alt orta pivot point (ayaklar)
        this.sprite.setScale(0.5); // Boyut artırıldı - daha görünür olsun
        this.sprite.setDepth(10000); // Çok yüksek depth - her zaman en üstte
        
        console.log('✅ Cyberpunk character created at:', this.sprite.x, this.sprite.y, 'depth:', this.sprite.depth);

        // 🎬 Create animations
        this.createAnimations();
        
        // Başlangıç animasyonu: IDLE
        this.sprite.play('player-idle');

        // Glow efekti kaldırıldı - karakter kendi neon ışıklara sahip
    }
    
    createAnimations() {
        // IDLE animasyonu (Frame 2 - ortadaki frame)
        if (!this.scene.anims.exists('player-idle')) {
            this.scene.anims.create({
                key: 'player-idle',
                frames: this.scene.anims.generateFrameNumbers('cyberpunk-char', { start: 2, end: 2 }),
                frameRate: 1,
                repeat: -1
            });
        }
        
        // WALK animasyonu (Frame 4-11 - 8 yön yürüme)
        if (!this.scene.anims.exists('player-walk')) {
            this.scene.anims.create({
                key: 'player-walk',
                frames: this.scene.anims.generateFrameNumbers('cyberpunk-char', { start: 4, end: 11 }),
                frameRate: 12, // Hızlı yürüme animasyonu
                repeat: -1
            });
        }
    }

    move(dirX, dirY) {
        // Calculate new grid position
        const newGridX = Phaser.Math.Clamp(this.gridX + dirX * this.speed, 1, this.scene.gridWidth - 2);
        const newGridY = Phaser.Math.Clamp(this.gridY + dirY * this.speed, 1, this.scene.gridHeight - 2);

        // Update position
        this.gridX = newGridX;
        this.gridY = newGridY;

        // Calculate offset - TAM EKRAN için dinamik
        const offsetX = this.scene.cameras.main.width / 2;
        const offsetY = this.scene.cameras.main.height / 2;

        // Convert to isometric position
        const pos = this.scene.cartesianToIsometric(this.gridX, this.gridY);
        this.sprite.x = pos.x + offsetX;
        this.sprite.y = pos.y + offsetY - 30;

        this.updateDepth();

        // 🎬 Play walk animation (hareket ediyor)
        if (this.sprite.anims.currentAnim?.key !== 'player-walk') {
            this.sprite.play('player-walk');
        }
        
        this.isMoving = true;
    }

    updateDepth() {
        // Karakter her zaman en üstte - sabit depth
        // Binalardan daha yüksek depth değeri
        this.sprite.setDepth(10000);
    }

    getGridPosition() {
        return { 
            x: Math.round(this.gridX), 
            y: Math.round(this.gridY) 
        };
    }
}

