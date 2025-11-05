import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // This scene handles the overlay UI
        // Most UI is handled through HTML/CSS for better control
        
        // Add keyboard hints
        this.createKeyboardHints();
        
        // Listen for events from main scene
        this.registry.events.on('changedata', this.updateUI, this);
    }

    createKeyboardHints() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Controls hint
        const hints = this.add.text(20, height - 80, 
            'Controls: WASD or Arrow Keys to move\nE or Space to interact', {
            font: '14px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: { x: 10, y: 8 }
        });
        hints.setScrollFactor(0);
        hints.setDepth(1000);
    }

    updateUI(parent, key, data) {
        // Handle UI updates from registry changes
        if (key === 'points') {
            this.updatePoints(data);
        }
    }

    updatePoints(points) {
        // This will be handled by the HTML UI
        const pointsElement = document.getElementById('points-value');
        if (pointsElement) {
            pointsElement.textContent = points;
        }
    }
}

