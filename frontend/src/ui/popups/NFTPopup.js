import contractManager from '../../web3/contracts.js';
import walletManager from '../../web3/wallet.js';
import pointsManager from '../../web3/points.js';
import toastManager from '../../utils/ToastManager.js';

export default class NFTPopup {
    constructor() {
        this.isMinting = false;
        this.selectedNFT = null;
        this.STORAGE_KEY = 'somnia_minted_nfts';
        this.mintedNFTs = {}; // { address: [nftId1, nftId2, ...] }
        this.loadMintedNFTs();
    }

    loadMintedNFTs() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.mintedNFTs = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading minted NFTs:', error);
            this.mintedNFTs = {};
        }
    }

    saveMintedNFTs() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mintedNFTs));
        } catch (error) {
            console.error('Error saving minted NFTs:', error);
        }
    }

    isNFTMinted(nftId, address) {
        if (!address) return false;
        const normalizedAddress = address.toLowerCase();
        return this.mintedNFTs[normalizedAddress]?.includes(nftId) || false;
    }

    markNFTAsMinted(nftId, address) {
        if (!address) return;
        const normalizedAddress = address.toLowerCase();
        if (!this.mintedNFTs[normalizedAddress]) {
            this.mintedNFTs[normalizedAddress] = [];
        }
        if (!this.mintedNFTs[normalizedAddress].includes(nftId)) {
            this.mintedNFTs[normalizedAddress].push(nftId);
            this.saveMintedNFTs();
        }
    }

    render(title) {
        const nfts = contractManager.getNFTCollection();
        const currentAddress = walletManager.address;
        const currentPoints = pointsManager.getPoints(currentAddress);
        
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
                        ${nfts.map(nft => {
                            const hasEnoughPoints = currentPoints >= nft.pointsRequired;
                            const isMinted = this.isNFTMinted(nft.id, currentAddress);
                            const canMint = hasEnoughPoints && !isMinted;
                            return `
                            <div class="nft-card" data-nft-id="${nft.id}" data-points-required="${nft.pointsRequired}" data-is-minted="${isMinted}" style="
                                background: rgba(255, 255, 255, 0.05);
                                border: 2px solid transparent;
                                border-radius: 12px;
                                padding: 15px;
                                cursor: ${canMint ? 'pointer' : 'not-allowed'};
                                transition: all 0.3s ease;
                                opacity: ${canMint ? '1' : '0.5'};
                                position: relative;
                            ">
                                ${isMinted ? `
                                <div style="position: absolute; top: 10px; right: 10px; background: rgba(34, 197, 94, 0.9); color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; z-index: 10;">
                                    MINTED ✓
                                </div>
                                ` : ''}
                                <div style="display: flex; gap: 15px; align-items: center;">
                                    <img src="${nft.image}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover; ${isMinted ? 'filter: grayscale(50%);' : ''}" alt="${nft.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+TkZUPC90ZXh0Pjwvc3ZnPg=='">
                                    <div style="flex: 1;">
                                        <h3 style="margin: 0 0 5px 0; font-size: 16px;">${nft.name}</h3>
                                        <p style="margin: 0 0 8px 0; opacity: 0.7; font-size: 12px;">${nft.description}</p>
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                            <span style="color: #FF0080; font-weight: 600;">${nft.price}</span>
                                            <span style="font-size: 12px; color: ${canMint ? '#4ade80' : isMinted ? '#4ade80' : '#f87171'}; font-weight: 600;">
                                                ${nft.pointsRequired} pts ${canMint ? '✓' : isMinted ? '✓' : '✗'}
                                            </span>
                                        </div>
                                        ${!canMint && !isMinted ? `<p style="margin: 0; font-size: 11px; color: #f87171;">Need ${nft.pointsRequired - currentPoints} more points</p>` : ''}
                                        ${isMinted ? `<p style="margin: 0; font-size: 11px; color: #4ade80; font-weight: 600;">Already minted!</p>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>

                <div class="info-row" style="background: rgba(255, 255, 255, 0.05); margin-bottom: 15px;">
                    <span class="info-label">Your Points:</span>
                    <span class="info-value" style="color: #FF0080; font-weight: 700;">${currentPoints}</span>
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
                const isMinted = card.dataset.isMinted === 'true';
                if (!isMinted) {
                    this.selectNFT(card);
                }
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
        
        const pointsRequired = parseInt(card.dataset.pointsRequired);
        const currentAddress = walletManager.address;
        const currentPoints = pointsManager.getPoints(currentAddress);
        const hasEnoughPoints = currentPoints >= pointsRequired;
        const isMinted = card.dataset.isMinted === 'true';

        // Enable/disable mint button based on points and mint status
        const mintBtn = document.getElementById('mint-btn');
        if (isMinted) {
            mintBtn.disabled = true;
            mintBtn.textContent = 'Already Minted';
        } else if (hasEnoughPoints) {
            mintBtn.disabled = false;
            mintBtn.textContent = `Mint NFT #${this.selectedNFT}`;
        } else {
            mintBtn.disabled = true;
            mintBtn.textContent = `Need ${pointsRequired} points (You have ${currentPoints})`;
        }
    }

    async mintNFT() {
        if (this.isMinting || !this.selectedNFT) return;

        if (!walletManager.isConnected) {
            this.showMessage('Please connect your wallet first', 'error');
            return;
        }

        // Get NFT info and check points
        const nfts = contractManager.getNFTCollection();
        const selectedNFTData = nfts.find(nft => nft.id == this.selectedNFT);
        
        if (!selectedNFTData) {
            this.showMessage('NFT not found', 'error');
            return;
        }

        const currentAddress = walletManager.address;
        const currentPoints = pointsManager.getPoints(currentAddress);
        
        // Check if already minted
        if (this.isNFTMinted(this.selectedNFT, currentAddress)) {
            this.showMessage('This NFT has already been minted!', 'error');
            return;
        }
        
        if (currentPoints < selectedNFTData.pointsRequired) {
            this.showMessage(`Insufficient points! You need ${selectedNFTData.pointsRequired} points but only have ${currentPoints}`, 'error');
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
                // Mark NFT as minted
                this.markNFTAsMinted(this.selectedNFT, currentAddress);
                
                // Deduct points after successful mint
                pointsManager.deductPoints(selectedNFTData.pointsRequired, currentAddress);
                
                this.showMessage(result.message, 'success');
                toastManager.success(`NFT #${this.selectedNFT} minted successfully!`);
                
                setTimeout(() => {
                    this.showMessage(`Points deducted: -${selectedNFTData.pointsRequired}`, 'success');
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

