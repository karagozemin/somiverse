export default class Player {
    constructor(scene, gridX, gridY) {
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.speed = 0.08;
        this.isMoving = false;
        this.currentDirection = 'idle';
        this.lastDirection = { x: 0, y: 0 }; // Son hareket yönü

        // Calculate offset - TAM EKRAN için dinamik
        const offsetX = this.scene.cameras.main.width / 2;
        const offsetY = this.scene.cameras.main.height / 2;

        // 🎮 Create cyberpunk character sprite
        const pos = this.scene.cartesianToIsometric(gridX, gridY);
        this.sprite = this.scene.add.sprite(pos.x + offsetX, pos.y + offsetY - 50, 'character-sheet', 0);
        this.sprite.setOrigin(0.5, 0.92); // Alt orta pivot point (ayaklar zemine oturur, kafa tam görünür)
        this.sprite.setScale(0.45); // Karakter boyutu - küçültüldü
        this.sprite.setDepth(10000); // Çok yüksek depth - her zaman en üstte
        
        console.log('✅ Karakter oluşturuldu:', {
            position: { x: this.sprite.x, y: this.sprite.y },
            frame: this.sprite.frame.name,
            depth: this.sprite.depth,
            scale: this.sprite.scale
        });

        // 🎬 Create animations
        this.createAnimations();
        
        // Başlangıç animasyonu: IDLE
        this.sprite.play('player-idle');

        // Glow efekti kaldırıldı - karakter kendi neon ışıklara sahip
    }
    
    createAnimations() {
        // IDLE animasyonu (Frame 0 - Düz Durş)
        if (!this.scene.anims.exists('player-idle')) {
            this.scene.anims.create({
                key: 'player-idle',
                frames: [{ key: 'character-sheet', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
            console.log('✅ IDLE animasyonu oluşturuldu (Frame 0)');
        }
        
        // WALK animasyonu (Frame 1-2 - yürüme döngüsü)
        if (!this.scene.anims.exists('player-walk')) {
            this.scene.anims.create({
                key: 'player-walk',
                frames: [
                    { key: 'character-sheet', frame: 1 },
                    { key: 'character-sheet', frame: 2 },
                    { key: 'character-sheet', frame: 1 },
                    { key: 'character-sheet', frame: 0 } // Ara adım - daha akıcı
                ],
                frameRate: 10, // Yürüme hızı - daha hızlı ve akıcı
                repeat: -1
            });
            console.log('✅ WALK animasyonu oluşturuldu (Frame 0-1-2 döngüsü)');
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
        this.sprite.y = pos.y + offsetY - 50;

        this.updateDepth();

        // 🎯 YÖN KONTROLÜ - Karakteri gidiş yönüne göre çevir
        // Sol-Sağ kontrolü (X ekseni)
        if (dirX < 0) {
            // SOLA gidiyor - karakteri sola çevir
            this.sprite.setFlipX(true);
        } else if (dirX > 0) {
            // SAĞA gidiyor - normal yön
            this.sprite.setFlipX(false);
        }
        
        // Yukarı-Aşağı için ek kontroller (isteğe bağlı)
        // İzometrik görünümde Y hareketi genelde flip gerektirmez
        
        // 🎬 YÜRÜME ANİMASYONU OYNAT
        if (this.sprite.anims.currentAnim?.key !== 'player-walk') {
            this.sprite.play('player-walk');
        }
        
        this.isMoving = true;
        this.lastDirection = { x: dirX, y: dirY };
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

