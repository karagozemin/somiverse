import contractManager from '../../web3/contracts.js';
import walletManager from '../../web3/wallet.js';
import pointsManager from '../../web3/points.js';
import toastManager from '../../utils/ToastManager.js';

export default class NFTPopup {
    constructor() {
        this.isMinting = false;
        this.selectedNFT = null;
    }

    render(title) {
        const reward = pointsManager.getReward('nft');
        const nfts = contractManager.getNFTCollection();
        
        return `
            <div class="popup-header">
                <h2 class="popup-title">${title}</h2>
                <button class="close-btn" id="close-popup">&times;</button>
            </div>
            <div class="popup-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🎨</div>
                    <p style="opacity: 0.7; font-size: 14px;">Mint unique Somnia NFTs</p>
                </div>

                <div style="max-height: 300px; overflow-y: auto; margin: 20px 0;">
                    <div id="nft-grid" style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                        ${nfts.map(nft => `
                            <div class="nft-card" data-nft-id="${nft.id}" style="
                                background: rgba(255, 255, 255, 0.05);
                                border: 2px solid transparent;
                                border-radius: 12px;
                                padding: 15px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            ">
                                <div style="display: flex; gap: 15px; align-items: center;">
                                    <img src="${nft.image}" style="width: 80px; height: 80px; border-radius: 8px;" alt="${nft.name}">
                                    <div style="flex: 1;">
                                        <h3 style="margin: 0 0 5px 0; font-size: 16px;">${nft.name}</h3>
                                        <p style="margin: 0 0 10px 0; opacity: 0.7; font-size: 12px;">${nft.description}</p>
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span style="color: #FF0080; font-weight: 600;">${nft.price}</span>
                                            <span style="font-size: 12px; opacity: 0.6;">#${nft.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="info-row" style="background: rgba(255, 0, 128, 0.1);">
                    <span class="info-label">Points Reward:</span>
                    <span class="info-value" style="color: #FF0080; font-weight: 700;">+${reward}</span>
                </div>

                <button class="action-button" id="mint-btn" disabled>
                    Select an NFT to Mint
                </button>

                <div id="result-message" style="margin-top: 15px; padding: 12px; border-radius: 8px; display: none;"></div>
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('close-popup')?.addEventListener('click', () => {
            this.close();
        });

        // NFT card selection
        document.querySelectorAll('.nft-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectNFT(card);
            });
        });

        document.getElementById('mint-btn')?.addEventListener('click', () => {
            this.mintNFT();
        });
    }

    selectNFT(card) {
        // Remove previous selection
        document.querySelectorAll('.nft-card').forEach(c => {
            c.style.border = '2px solid transparent';
        });

        // Highlight selected
        card.style.border = '2px solid #FF0080';
        this.selectedNFT = card.dataset.nftId;

        // Enable mint button
        const mintBtn = document.getElementById('mint-btn');
        mintBtn.disabled = false;
        mintBtn.textContent = `Mint NFT #${this.selectedNFT}`;
    }

    async mintNFT() {
        if (this.isMinting || !this.selectedNFT) return;

        if (!walletManager.isConnected) {
            this.showMessage('Please connect your wallet first', 'error');
            return;
        }

        this.isMinting = true;
        const btn = document.getElementById('mint-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Minting...';
        btn.disabled = true;

        try {
            const result = await contractManager.mintNFT(this.selectedNFT);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                toastManager.success(`NFT #${this.selectedNFT} minted successfully!`);
                
                setTimeout(() => {
                    const reward = pointsManager.getReward('nft');
                    this.showMessage(`🎉 +${reward} Points Earned!`, 'success');
                    toastManager.success(`+${reward} Points!`, 2000);
                }, 1500);

                setTimeout(() => {
                    this.close();
                }, 3000);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            btn.textContent = originalText;
            btn.disabled = false;
        } finally {
            this.isMinting = false;
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

