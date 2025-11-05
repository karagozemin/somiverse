import SwapPopup from './SwapPopup.js';
import NFTPopup from './NFTPopup.js';
import FaucetPopup from './FaucetPopup.js';
import StakingPopup from './StakingPopup.js';

class PopupManager {
    constructor() {
        this.overlay = document.getElementById('popup-overlay');
        this.content = document.getElementById('popup-content');
        this.currentPopup = null;
        
        this.setupCloseHandlers();
    }

    setupCloseHandlers() {
        // Close on overlay click
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closePopup();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay?.style.display !== 'none') {
                this.closePopup();
            }
        });
    }

    openPopup(type, title) {
        if (!this.overlay || !this.content) return;

        let popup;
        switch (type) {
            case 'swap':
                popup = new SwapPopup();
                break;
            case 'nft':
                popup = new NFTPopup();
                break;
            case 'faucet':
                popup = new FaucetPopup();
                break;
            case 'staking':
                popup = new StakingPopup();
                break;
            default:
                console.error('Unknown popup type:', type);
                return;
        }

        this.currentPopup = popup;
        this.content.innerHTML = popup.render(title);
        popup.attachEventListeners();
        
        this.overlay.style.display = 'flex';
        
        // Pause Phaser game
        if (window.somniaGame) {
            window.somniaGame.scene.pause('MainScene');
        }
    }

    closePopup() {
        if (!this.overlay) return;

        this.overlay.style.display = 'none';
        this.content.innerHTML = '';
        this.currentPopup = null;

        // Resume Phaser game
        if (window.somniaGame) {
            window.somniaGame.scene.resume('MainScene');
        }
    }
}

// Singleton instance
const popupManager = new PopupManager();

export default popupManager;

