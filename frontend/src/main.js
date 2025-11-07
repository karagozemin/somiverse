import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';
import UIScene from './scenes/UIScene.js';
import './utils/ToastManager.js';
import './web3/wallet.js';

// Only initialize game if container is visible (after intro)
function initGame() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer || gameContainer.style.display === 'none') {
        // Wait for intro to finish
        const checkInterval = setInterval(() => {
            const container = document.getElementById('game-container');
            if (container && container.style.display !== 'none') {
                clearInterval(checkInterval);
                createGame();
            }
        }, 100);
        return;
    }
    
    createGame();
}

function createGame() {
    // Game configuration - TAM EKRAN!
    const config = {
        type: Phaser.AUTO,
        parent: 'phaser-game',
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: true, // Transparent background to show CSS gradient
        scale: {
            mode: Phaser.Scale.RESIZE, // TAM EKRAN - Dinamik boyutlandırma
            autoCenter: Phaser.Scale.NO_CENTER // Merkez yok, tam ekran
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
    
    // TAM EKRAN - Window resize listener
    window.addEventListener('resize', () => {
        if (game && game.scale) {
            game.scale.resize(window.innerWidth, window.innerHeight);
        }
    });
}

// Initialize game
initGame();

