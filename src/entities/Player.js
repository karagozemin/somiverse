export default class Player {
    constructor(scene, gridX, gridY) {
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.speed = 0.1;
        this.isMoving = false;

        // Create sprite
        const pos = this.scene.cartesianToIsometric(gridX, gridY);
        this.sprite = this.scene.add.sprite(pos.x, pos.y - 20, 'player');
        this.sprite.setOrigin(0.5, 0.5);
        this.updateDepth();

        // Add glow effect
        this.glow = this.scene.add.circle(pos.x, pos.y, 30, 0xFF0080, 0.2);
        this.glow.setDepth(this.sprite.depth - 1);

        // Animate glow
        this.scene.tweens.add({
            targets: this.glow,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.1,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    move(dirX, dirY) {
        // Calculate new grid position
        const newGridX = Phaser.Math.Clamp(this.gridX + dirX * this.speed, 1, this.scene.gridWidth - 2);
        const newGridY = Phaser.Math.Clamp(this.gridY + dirY * this.speed, 1, this.scene.gridHeight - 2);

        // Update position
        this.gridX = newGridX;
        this.gridY = newGridY;

        // Convert to isometric position
        const pos = this.scene.cartesianToIsometric(this.gridX, this.gridY);
        this.sprite.x = pos.x;
        this.sprite.y = pos.y - 20;
        this.glow.x = pos.x;
        this.glow.y = pos.y;

        this.updateDepth();

        // Add subtle rotation for movement feedback
        const angle = Math.atan2(dirY, dirX);
        this.sprite.rotation = Phaser.Math.Linear(this.sprite.rotation, angle, 0.1);
    }

    updateDepth() {
        const depth = Math.floor(this.gridY * 100 + this.gridX) + 50;
        this.sprite.setDepth(depth);
    }

    getGridPosition() {
        return { 
            x: Math.round(this.gridX), 
            y: Math.round(this.gridY) 
        };
    }
}

