import { ethers } from 'ethers';

class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isConnected = false;

        // Somnia Testnet Configuration
        this.somniaConfig = {
            chainId: '0x7A31', // 31281 in hex (Somnia testnet chain ID - placeholder, update with actual)
            chainName: 'Somnia Testnet',
            nativeCurrency: {
                name: 'STT',
                symbol: 'STT',
                decimals: 18
            },
            rpcUrls: ['https://dream-rpc.somnia.network'], // Placeholder - update with actual RPC
            blockExplorerUrls: ['https://somnia.network/explorer']
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
        }
    }

    async connectWallet() {
        if (!window.ethereum) {
            alert('Please install MetaMask or another Web3 wallet!');
            return false;
        }

        try {
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

            console.log('Wallet connected:', this.address);
            return true;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet: ' + error.message);
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
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isConnected = false;
        this.updateUI();
    }

    updateUI() {
        const walletBtn = document.getElementById('connect-wallet');
        const walletText = document.getElementById('wallet-text');
        const pointsContainer = document.getElementById('points-container');

        if (this.isConnected && this.address) {
            const shortAddress = `${this.address.substring(0, 6)}...${this.address.substring(38)}`;
            walletText.textContent = shortAddress;
            pointsContainer.style.display = 'flex';

            // Load points
            import('./points.js').then(module => {
                const points = module.default.getPoints(this.address);
                document.getElementById('points-value').textContent = points;
            });
        } else {
            walletText.textContent = 'Connect Wallet';
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

// Connect wallet button handler
document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connect-wallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            walletManager.connectWallet();
        });
    }
});

export default walletManager;

