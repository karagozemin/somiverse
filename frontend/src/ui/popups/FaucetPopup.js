import faucetService from '../../web3/faucet.js';
import walletManager from '../../web3/wallet.js';
import pointsManager from '../../web3/points.js';
import toastManager from '../../utils/ToastManager.js';

export default class FaucetPopup {
    constructor() {
        this.isClaiming = false;
    }

    render(title) {
        const reward = pointsManager.getReward('faucet');
        const userAddress = walletManager.isConnected ? walletManager.getAddress() : 'Not connected';
        const canClaim = walletManager.isConnected && faucetService.canClaim(userAddress);
        const cooldownText = walletManager.isConnected ? faucetService.formatCooldownTime(userAddress) : '-';
        
        return `
            <div class="popup-header">
                <h2 class="popup-title">${title}</h2>
                <button class="close-btn" id="close-popup">&times;</button>
            </div>
            <div class="popup-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🚰</div>
                    <p style="opacity: 0.7; font-size: 14px;">Get free test tokens</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Your Wallet Address</label>
                    <div class="info-row" style="padding: 16px; background: rgba(255, 255, 255, 0.03); word-break: break-all;">
                        <span style="font-family: monospace; font-size: 13px; opacity: 0.9;">${userAddress}</span>
                    </div>
                </div>

                <div class="info-row">
                    <span class="info-label">Amount:</span>
                    <span class="info-value" style="color: #00D4FF;">0.1 STT</span>
                </div>

                <div class="info-row">
                    <span class="info-label">Cooldown:</span>
                    <span class="info-value" id="cooldown-text">${cooldownText}</span>
                </div>

                <div class="info-row">
                    <span class="info-label">Limit:</span>
                    <span class="info-value">Once per 24 hours</span>
                </div>

                <div class="info-row" style="background: rgba(255, 0, 128, 0.1);">
                    <span class="info-label">Points Reward:</span>
                    <span class="info-value" style="color: #FF0080; font-weight: 700;">+${reward}</span>
                </div>

                <button class="action-button" id="claim-btn" ${!canClaim || !walletManager.isConnected ? 'disabled' : ''} 
                    style="${!canClaim || !walletManager.isConnected ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                    ${!walletManager.isConnected ? 'Connect Wallet First' : (canClaim ? 'Get 0.1 STT' : 'Cooldown Active')}
                </button>

                <div id="result-message" style="margin-top: 15px; padding: 12px; border-radius: 8px; display: none;"></div>
                
                <div style="margin-top: 15px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <p style="font-size: 12px; opacity: 0.7; margin: 0; text-align: center;">
                        💡 Tip: Use faucet to get test tokens for swapping and staking
                    </p>
                </div>
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

        const userAddress = walletManager.getAddress();
        
        if (!faucetService.canClaim(userAddress)) {
            this.showMessage('Please wait for cooldown to finish', 'error');
            return;
        }

        this.isClaiming = true;
        const btn = document.getElementById('claim-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Claiming...';
        btn.disabled = true;

        try {
            const result = await faucetService.claimTokens(userAddress);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                toastManager.success('Successfully claimed 0.1 STT!');
                
                // Award points
                pointsManager.addPoints(userAddress, 'faucet');
                
                setTimeout(() => {
                    const reward = pointsManager.getReward('faucet');
                    this.showMessage(`🎉 +${reward} Points Earned!`, 'success');
                    toastManager.success(`+${reward} Points!`, 2000);
                }, 1500);

                // Update cooldown display
                setTimeout(() => {
                    const cooldownText = faucetService.formatCooldownTime(userAddress);
                    document.getElementById('cooldown-text').textContent = cooldownText;
                    btn.textContent = 'Cooldown Active';
                }, 2000);

                setTimeout(() => {
                    this.close();
                }, 3500);
            }
        } catch (error) {
            console.error('Claim error:', error);
            this.showMessage(error.message || 'Failed to claim tokens', 'error');
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

