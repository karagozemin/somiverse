import { ethers } from 'ethers';
import toastManager from '../utils/ToastManager.js';
import pointsManager from './points.js';

class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isConnected = false;

        // Somnia Testnet Configuration (Shannon)
        this.somniaConfig = {
            chainId: '0xC488', // 50312 in hex (Somnia Shannon Testnet)
            chainName: 'Somnia Shannon Testnet',
            nativeCurrency: {
                name: 'STT',
                symbol: 'STT',
                decimals: 18
            },
            rpcUrls: ['https://dream-rpc.somnia.network'],
            blockExplorerUrls: ['https://shannon-explorer.somnia.network/']
        };

        this.init();
    }

    init() {
        // Check if wallet is already connected
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.handleAccountsChanged(accounts);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            // Auto-reconnect if previously connected
            this.autoReconnect();
        }
    }

    async autoReconnect() {
        const wasConnected = localStorage.getItem('walletConnected');
        if (wasConnected === 'true') {
            try {
                // Check if already has permission
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts' 
                });
                
                if (accounts.length > 0) {
                    console.log('Auto-reconnecting wallet...');
                    this.provider = new ethers.BrowserProvider(window.ethereum);
                    this.signer = await this.provider.getSigner();
                    this.address = accounts[0];
                    this.isConnected = true;
                    
                    // Try to switch to Somnia network silently
                    await this.switchToSomniaNetwork();
                    
                    // Update UI
                    this.updateUI();
                    
                    console.log('Wallet auto-reconnected:', this.address);
                }
            } catch (error) {
                console.error('Auto-reconnect failed:', error);
                localStorage.removeItem('walletConnected');
            }
        }
    }

    async connectWallet() {
        if (!window.ethereum) {
            toastManager.error('Please install MetaMask or another Web3 wallet!');
            return false;
        }

        try {
            toastManager.info('Connecting to wallet...');
            
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });

            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.address = accounts[0];
            this.isConnected = true;

            // Try to switch to Somnia network
            await this.switchToSomniaNetwork();

            // Update UI
            this.updateUI();

            // Save connection state to localStorage
            localStorage.setItem('walletConnected', 'true');

            toastManager.success('Wallet connected successfully!');
            console.log('Wallet connected:', this.address);
            return true;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            toastManager.error('Failed to connect wallet: ' + error.message);
            return false;
        }
    }

    async switchToSomniaNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.somniaConfig.chainId }],
            });
        } catch (switchError) {
            // Chain doesn't exist, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.somniaConfig],
                    });
                } catch (addError) {
                    console.error('Error adding Somnia network:', addError);
                }
            } else {
                console.error('Error switching to Somnia network:', switchError);
            }
        }
    }

    async handleAccountsChanged(accounts) {
        if (accounts.length > 0) {
            this.address = accounts[0];
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.updateUI();
        }
    }

    disconnect() {
        const previousAddress = this.address;
        const points = pointsManager.getPoints(previousAddress);
        
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isConnected = false;
        
        // Remove connection state from localStorage
        localStorage.removeItem('walletConnected');
        
        this.updateUI();
        
        toastManager.info(`Wallet disconnected. Your ${points} points are saved!`);
        console.log('Wallet disconnected');
    }
    
    async reconnect() {
        // Helper method to reconnect with previous address
        return this.connectWallet();
    }

    updateUI() {
        const walletBtn = document.getElementById('connect-wallet');
        const walletText = document.getElementById('wallet-text');
        const pointsContainer = document.getElementById('points-container');

        if (this.isConnected && this.address) {
            const shortAddress = `${this.address.substring(0, 6)}...${this.address.substring(38)}`;
            walletText.textContent = shortAddress;
            walletBtn.title = 'Click to disconnect';
            pointsContainer.style.display = 'flex';

            // Load points
            import('./points.js').then(module => {
                const points = module.default.getPoints(this.address);
                document.getElementById('points-value').textContent = points;
            });
        } else {
            walletText.textContent = 'Connect Wallet';
            walletBtn.title = 'Click to connect wallet';
            pointsContainer.style.display = 'none';
        }
    }

    getAddress() {
        return this.address;
    }

    getSigner() {
        return this.signer;
    }

    getProvider() {
        return this.provider;
    }
}

// Singleton instance
const walletManager = new WalletManager();

// Wallet dropdown menu
let walletDropdown = null;

function createWalletDropdown() {
    if (walletDropdown) {
        walletDropdown.remove();
    }

    walletDropdown = document.createElement('div');
    walletDropdown.id = 'wallet-dropdown';
    walletDropdown.style.cssText = `
        position: fixed;
        top: 90px;
        right: 30px;
        min-width: 220px;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        padding: 8px;
        z-index: 10000;
        animation: dropdownSlide 0.2s ease;
    `;

    const address = walletManager.getAddress();
    const shortAddress = `${address.substring(0, 6)}...${address.substring(38)}`;
    const points = pointsManager.getPoints(address);

    walletDropdown.innerHTML = `
        <style>
            @keyframes dropdownSlide {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .dropdown-item {
                padding: 12px 16px;
                color: white;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
            }
            .dropdown-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .dropdown-header {
                padding: 12px 16px;
                color: white;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 8px;
            }
            .dropdown-address {
                font-weight: 600;
                font-size: 15px;
                margin-bottom: 4px;
            }
            .dropdown-points {
                font-size: 13px;
                opacity: 0.7;
            }
            .disconnect-item {
                color: #ff4444;
            }
            .disconnect-item:hover {
                background: rgba(255, 68, 68, 0.1);
            }
        </style>
        <div class="dropdown-header">
            <div class="dropdown-address">${shortAddress}</div>
            <div class="dropdown-points">Points: ${points}</div>
        </div>
        <div class="dropdown-item disconnect-item" id="disconnect-wallet">
            <span>🚪</span>
            <span>Disconnect</span>
        </div>
    `;

    document.body.appendChild(walletDropdown);

    // Disconnect handler
    document.getElementById('disconnect-wallet').addEventListener('click', (e) => {
        e.stopPropagation();
        walletManager.disconnect();
        closeWalletDropdown();
    });

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 10);
}

function closeWalletDropdown() {
    if (walletDropdown) {
        walletDropdown.remove();
        walletDropdown = null;
        document.removeEventListener('click', handleOutsideClick);
    }
}

function handleOutsideClick(e) {
    if (walletDropdown && !walletDropdown.contains(e.target)) {
        closeWalletDropdown();
    }
}

// Connect/Disconnect wallet button handler
function initWalletButton() {
    const connectBtn = document.getElementById('connect-wallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (walletManager.isConnected) {
                // Toggle dropdown
                if (walletDropdown) {
                    closeWalletDropdown();
                } else {
                    createWalletDropdown();
                }
            } else {
                // Connect
                walletManager.connectWallet();
            }
        });
        console.log('Wallet button initialized');
    } else {
        console.warn('Connect wallet button not found, retrying...');
        setTimeout(initWalletButton, 100);
    }
}

// Try to init immediately and also on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWalletButton);
} else {
    initWalletButton();
}

export default walletManager;

