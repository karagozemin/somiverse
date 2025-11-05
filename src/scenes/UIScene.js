import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // This scene handles the overlay UI
        // Most UI is handled through HTML/CSS for better control
        
        // Listen for events from main scene
        this.registry.events.on('changedata', this.updateUI, this);
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

