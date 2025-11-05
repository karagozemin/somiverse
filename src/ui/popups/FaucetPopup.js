import contractManager from '../../web3/contracts.js';
import walletManager from '../../web3/wallet.js';
import pointsManager from '../../web3/points.js';

export default class FaucetPopup {
    constructor() {
        this.isClaiming = false;
    }

    render(title) {
        const reward = pointsManager.getReward('faucet');
        
        return `
            <div class="popup-header">
                <h2 class="popup-title">${title}</h2>
                <button class="close-btn" id="close-popup">&times;</button>
            </div>
            <div class="popup-body">
                <div style="text-align: center; margin: 30px 0;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🚰</div>
                    <p style="font-size: 18px; margin-bottom: 10px;">Get free test tokens!</p>
                    <p style="opacity: 0.7; font-size: 14px;">Claim 100 STT tokens for testing</p>
                </div>

                <div class="info-row">
                    <span class="info-label">Amount:</span>
                    <span class="info-value">100 STT</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Cooldown:</span>
                    <span class="info-value">24 hours</span>
                </div>

                <div class="info-row" style="background: rgba(255, 0, 128, 0.1);">
                    <span class="info-label">Points Reward:</span>
                    <span class="info-value" style="color: #FF0080; font-weight: 700;">+${reward}</span>
                </div>

                <button class="action-button" id="claim-btn">
                    Claim Tokens
                </button>

                <div id="result-message" style="margin-top: 15px; padding: 12px; border-radius: 8px; display: none;"></div>
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('close-popup')?.addEventListener('click', () => {
            this.close();
        });

        document.getElementById('claim-btn')?.addEventListener('click', () => {
            this.claimTokens();
        });
    }

    async claimTokens() {
        if (this.isClaiming) return;

        if (!walletManager.isConnected) {
            this.showMessage('Please connect your wallet first', 'error');
            return;
        }

        this.isClaiming = true;
        const btn = document.getElementById('claim-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Claiming...';
        btn.disabled = true;

        try {
            const result = await contractManager.claimFaucet();
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                
                // Show points earned
                setTimeout(() => {
                    const reward = pointsManager.getReward('faucet');
                    this.showMessage(`🎉 +${reward} Points Earned!`, 'success');
                }, 1500);

                // Close popup after delay
                setTimeout(() => {
                    this.close();
                }, 3000);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            btn.textContent = originalText;
            btn.disabled = false;
        } finally {
            this.isClaiming = false;
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('result-message');
        if (!messageEl) return;

        messageEl.textContent = message;
        messageEl.style.display = 'block';
        messageEl.style.background = type === 'success' 
            ? 'rgba(34, 197, 94, 0.2)' 
            : 'rgba(239, 68, 68, 0.2)';
        messageEl.style.color = type === 'success' ? '#4ade80' : '#f87171';
    }

    close() {
        import('./PopupManager.js').then(module => {
            module.default.closePopup();
        });
    }
}

