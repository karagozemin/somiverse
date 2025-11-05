import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';
import UIScene from './scenes/UIScene.js';
import './utils/ToastManager.js';
import './web3/wallet.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 1920,
    height: 1080,
    transparent: true, // Transparent background to show CSS gradient
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [BootScene, MainScene, UIScene],
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
        roundPixels: false,
        smoothTextures: true
    }
};

// Create game instance
const game = new Phaser.Game(config);

// Export for global access
window.somniaGame = game;

