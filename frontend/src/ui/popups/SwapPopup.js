import contractManager from '../../web3/contracts.js';
import walletManager from '../../web3/wallet.js';
import pointsManager from '../../web3/points.js';
import toastManager from '../../utils/ToastManager.js';

export default class SwapPopup {
    constructor() {
        this.isSwapping = false;
        // Only tokens that are actually deployed on Somnia testnet
        this.tokens = ['STT', 'USDT'];
    }

    render(title) {
        const reward = pointsManager.getReward('swap');
        
        return `
            <div class="popup-header">
                <h2 class="popup-title">${title}</h2>
                <button class="close-btn" id="close-popup">&times;</button>
            </div>
            <div class="popup-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">💱</div>
                    <p style="opacity: 0.7; font-size: 14px;">Swap tokens instantly</p>
                </div>

                <div class="form-group">
                    <label class="form-label">From</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" class="form-input" id="from-amount" placeholder="0.0" style="flex: 2;" value="1">
                        <select class="form-select" id="from-token" style="flex: 1;">
                            ${this.tokens.map(token => `<option value="${token}">${token}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div style="text-align: center; margin: 10px 0;">
                    <button style="background: rgba(255,255,255,0.1); border: none; border-radius: 50%; width: 40px; height: 40px; color: white; font-size: 20px; cursor: pointer;" id="swap-direction">
                        ⇅
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label">To (estimated)</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" class="form-input" id="to-amount" placeholder="0.0" style="flex: 2;" readonly>
                        <select class="form-select" id="to-token" style="flex: 1;">
                            ${this.tokens.map((token, i) => `<option value="${token}" ${i === 1 ? 'selected' : ''}>${token}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div id="quote-info" style="display: none; margin: 15px 0;">
                    <div class="info-row">
                        <span class="info-label">Rate:</span>
                        <span class="info-value" id="swap-rate">-</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Price Impact:</span>
                        <span class="info-value" id="price-impact">-</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Fee:</span>
                        <span class="info-value">0.3%</span>
                    </div>
                </div>

                <div class="info-row" style="background: rgba(255, 0, 128, 0.1);">
                    <span class="info-label">Points Reward:</span>
                    <span class="info-value" style="color: #FF0080; font-weight: 700;">+${reward}</span>
                </div>

                <button class="action-button" id="get-quote-btn">
                    Get Quote
                </button>

                <button class="action-button" id="swap-btn" style="display: none;">
                    Swap Tokens
                </button>

                <div id="result-message" style="margin-top: 15px; padding: 12px; border-radius: 8px; display: none;"></div>
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('close-popup')?.addEventListener('click', () => {
            this.close();
        });

        document.getElementById('swap-direction')?.addEventListener('click', () => {
            this.swapDirection();
        });

        document.getElementById('get-quote-btn')?.addEventListener('click', () => {
            this.getQuote();
        });

        document.getElementById('swap-btn')?.addEventListener('click', () => {
            this.executeSwap();
        });

        // Auto-update quote when amount changes
        document.getElementById('from-amount')?.addEventListener('input', () => {
            document.getElementById('quote-info').style.display = 'none';
            document.getElementById('swap-btn').style.display = 'none';
            document.getElementById('get-quote-btn').style.display = 'block';
        });
    }

    swapDirection() {
        const fromToken = document.getElementById('from-token');
        const toToken = document.getElementById('to-token');
        const temp = fromToken.value;
        fromToken.value = toToken.value;
        toToken.value = temp;
    }

    async getQuote() {
        const fromToken = document.getElementById('from-token').value;
        const toToken = document.getElementById('to-token').value;
        const amount = document.getElementById('from-amount').value;

        if (!amount || parseFloat(amount) <= 0) {
            this.showMessage('Please enter a valid amount', 'error');
            return;
        }

        if (fromToken === toToken) {
            this.showMessage('Please select different tokens', 'error');
            return;
        }

        try {
            const quote = await contractManager.getSwapQuote(fromToken, toToken, amount);
            
            document.getElementById('to-amount').value = quote.outputAmount;
            document.getElementById('swap-rate').textContent = `1 ${fromToken} = ${quote.rate} ${toToken}`;
            document.getElementById('price-impact').textContent = quote.priceImpact;
            
            document.getElementById('quote-info').style.display = 'block';
            document.getElementById('get-quote-btn').style.display = 'none';
            document.getElementById('swap-btn').style.display = 'block';
        } catch (error) {
            this.showMessage('Failed to get quote', 'error');
        }
    }

    async executeSwap() {
        if (this.isSwapping) return;

        if (!walletManager.isConnected) {
            this.showMessage('Please connect your wallet first', 'error');
            return;
        }

        const fromToken = document.getElementById('from-token').value;
        const toToken = document.getElementById('to-token').value;
        const amount = document.getElementById('from-amount').value;

        this.isSwapping = true;
        const btn = document.getElementById('swap-btn');
        btn.textContent = 'Swapping...';
        btn.disabled = true;

        try {
            const result = await contractManager.swapTokens(fromToken, toToken, amount);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                toastManager.success(`Swapped ${amount} ${fromToken} → ${toToken}`);
                
                setTimeout(() => {
                    const reward = pointsManager.getReward('swap');
                    this.showMessage(`🎉 +${reward} Points Earned!`, 'success');
                    toastManager.success(`+${reward} Points!`, 2000);
                }, 1500);

                setTimeout(() => {
                    this.close();
                }, 3000);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            btn.textContent = 'Swap Tokens';
            btn.disabled = false;
        } finally {
            this.isSwapping = false;
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

