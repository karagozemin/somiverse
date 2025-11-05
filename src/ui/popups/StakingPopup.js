import contractManager from '../../web3/contracts.js';
import walletManager from '../../web3/wallet.js';
import pointsManager from '../../web3/points.js';
import toastManager from '../../utils/ToastManager.js';

export default class StakingPopup {
    constructor() {
        this.isProcessing = false;
        this.stakingInfo = null;
    }

    render(title) {
        const reward = pointsManager.getReward('staking');
        this.stakingInfo = contractManager.getStakingInfo();
        
        return `
            <div class="popup-header">
                <h2 class="popup-title">${title}</h2>
                <button class="close-btn" id="close-popup">&times;</button>
            </div>
            <div class="popup-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🔒</div>
                    <p style="opacity: 0.7; font-size: 14px;">Stake tokens and earn rewards</p>
                </div>

                <!-- Staking Info -->
                <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                    <div class="info-row" style="background: transparent;">
                        <span class="info-label">Total Staked:</span>
                        <span class="info-value">${this.stakingInfo.totalStaked} STT</span>
                    </div>
                    <div class="info-row" style="background: transparent;">
                        <span class="info-label">Your Staked:</span>
                        <span class="info-value">${this.stakingInfo.userStaked} STT</span>
                    </div>
                    <div class="info-row" style="background: transparent;">
                        <span class="info-label">APY:</span>
                        <span class="info-value" style="color: #4ade80;">${this.stakingInfo.apy}</span>
                    </div>
                    <div class="info-row" style="background: transparent;">
                        <span class="info-label">Lock Period:</span>
                        <span class="info-value">${this.stakingInfo.lockPeriod}</span>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button class="tab-button active" id="stake-tab" style="
                        flex: 1;
                        padding: 12px;
                        background: rgba(255, 0, 128, 0.2);
                        border: 1px solid #FF0080;
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">Stake</button>
                    <button class="tab-button" id="unstake-tab" style="
                        flex: 1;
                        padding: 12px;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid transparent;
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">Unstake</button>
                </div>

                <!-- Stake Panel -->
                <div id="stake-panel">
                    <div class="form-group">
                        <label class="form-label">Amount to Stake</label>
                        <input type="number" class="form-input" id="stake-amount" placeholder="0.0" value="10">
                        <div style="display: flex; gap: 5px; margin-top: 8px;">
                            <button class="quick-amount" data-percent="25">25%</button>
                            <button class="quick-amount" data-percent="50">50%</button>
                            <button class="quick-amount" data-percent="75">75%</button>
                            <button class="quick-amount" data-percent="100">MAX</button>
                        </div>
                    </div>

                    <div class="info-row" style="background: rgba(255, 0, 128, 0.1);">
                        <span class="info-label">Points Reward:</span>
                        <span class="info-value" style="color: #FF0080; font-weight: 700;">+${reward}</span>
                    </div>

                    <button class="action-button" id="stake-btn">
                        Stake Tokens
                    </button>
                </div>

                <!-- Unstake Panel -->
                <div id="unstake-panel" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">Amount to Unstake</label>
                        <input type="number" class="form-input" id="unstake-amount" placeholder="0.0" value="10">
                    </div>

                    <div class="info-row">
                        <span class="info-label">Rewards Earned:</span>
                        <span class="info-value" style="color: #4ade80;">${this.stakingInfo.rewards} STT</span>
                    </div>

                    <button class="action-button" id="unstake-btn">
                        Unstake Tokens
                    </button>
                </div>

                <div id="result-message" style="margin-top: 15px; padding: 12px; border-radius: 8px; display: none;"></div>
            </div>

            <style>
                .quick-amount {
                    flex: 1;
                    padding: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .quick-amount:hover {
                    background: rgba(255, 0, 128, 0.2);
                    border-color: #FF0080;
                }
                .tab-button.active {
                    background: rgba(255, 0, 128, 0.2) !important;
                    border-color: #FF0080 !important;
                }
            </style>
        `;
    }

    attachEventListeners() {
        document.getElementById('close-popup')?.addEventListener('click', () => {
            this.close();
        });

        // Tab switching
        document.getElementById('stake-tab')?.addEventListener('click', () => {
            this.switchTab('stake');
        });

        document.getElementById('unstake-tab')?.addEventListener('click', () => {
            this.switchTab('unstake');
        });

        // Quick amount buttons
        document.querySelectorAll('.quick-amount').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const percent = e.target.dataset.percent;
                // Mock balance
                const balance = 100;
                const amount = (balance * parseInt(percent)) / 100;
                document.getElementById('stake-amount').value = amount;
            });
        });

        // Action buttons
        document.getElementById('stake-btn')?.addEventListener('click', () => {
            this.stake();
        });

        document.getElementById('unstake-btn')?.addEventListener('click', () => {
            this.unstake();
        });
    }

    switchTab(tab) {
        const stakeTab = document.getElementById('stake-tab');
        const unstakeTab = document.getElementById('unstake-tab');
        const stakePanel = document.getElementById('stake-panel');
        const unstakePanel = document.getElementById('unstake-panel');

        if (tab === 'stake') {
            stakeTab.classList.add('active');
            unstakeTab.classList.remove('active');
            stakePanel.style.display = 'block';
            unstakePanel.style.display = 'none';
        } else {
            stakeTab.classList.remove('active');
            unstakeTab.classList.add('active');
            stakePanel.style.display = 'none';
            unstakePanel.style.display = 'block';
        }
    }

    async stake() {
        if (this.isProcessing) return;

        if (!walletManager.isConnected) {
            this.showMessage('Please connect your wallet first', 'error');
            return;
        }

        const amount = document.getElementById('stake-amount').value;
        if (!amount || parseFloat(amount) <= 0) {
            this.showMessage('Please enter a valid amount', 'error');
            return;
        }

        this.isProcessing = true;
        const btn = document.getElementById('stake-btn');
        btn.textContent = 'Staking...';
        btn.disabled = true;

        try {
            const result = await contractManager.stakeTokens(amount);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                toastManager.success(`Staked ${amount} STT successfully!`);
                
                setTimeout(() => {
                    const reward = pointsManager.getReward('staking');
                    this.showMessage(`🎉 +${reward} Points Earned!`, 'success');
                    toastManager.success(`+${reward} Points!`, 2000);
                }, 1500);

                setTimeout(() => {
                    this.close();
                }, 3000);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            btn.textContent = 'Stake Tokens';
            btn.disabled = false;
        } finally {
            this.isProcessing = false;
        }
    }

    async unstake() {
        if (this.isProcessing) return;

        if (!walletManager.isConnected) {
            this.showMessage('Please connect your wallet first', 'error');
            return;
        }

        const amount = document.getElementById('unstake-amount').value;
        if (!amount || parseFloat(amount) <= 0) {
            this.showMessage('Please enter a valid amount', 'error');
            return;
        }

        this.isProcessing = true;
        const btn = document.getElementById('unstake-btn');
        btn.textContent = 'Unstaking...';
        btn.disabled = true;

        try {
            const result = await contractManager.unstakeTokens(amount);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                toastManager.success(`Unstaked ${amount} STT successfully!`);
                setTimeout(() => {
                    this.close();
                }, 2000);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            btn.textContent = 'Unstake Tokens';
            btn.disabled = false;
        } finally {
            this.isProcessing = false;
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

