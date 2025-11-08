import { ethers } from 'ethers';

class FaucetService {
    constructor() {
        this.faucetConfig = null;
        this.isInitialized = false;
        this.STORAGE_KEY = 'somnia_faucet_cooldowns';
        
        // Load cooldowns from localStorage
        this.loadCooldowns();
    }

    async init() {
        if (this.isInitialized) return true;

        try {
            // Try to import local config (will fail if not created yet)
            // Vite will try to resolve this at build time, so we need to handle it gracefully
            const configPath = '../config/faucet.config.local.js';
            let module;
            
            try {
                // Use dynamic import with timestamp to avoid caching issues
                module = await import(/* @vite-ignore */ configPath);
                this.faucetConfig = module.FAUCET_CONFIG;
                this.isInitialized = true;
                return true;
            } catch (importError) {
                // If local config doesn't exist, use default config (without private key)
                // This allows the app to run but faucet won't work until config is created
                console.warn('Faucet config not found. Using default config. Please copy faucet.config.template.js to faucet.config.local.js and add your private key.');
                this.faucetConfig = {
                    privateKey: null, // No private key means faucet won't work
                    amount: '0.1',
                    cooldown: 86400000 // 24 hours in milliseconds
                };
                this.isInitialized = true;
                return false; // Return false to indicate faucet is not fully configured
            }
        } catch (error) {
            console.error('Faucet initialization error:', error);
            // Use default config without private key
            this.faucetConfig = {
                privateKey: null,
                amount: '0.1',
                cooldown: 86400000
            };
            this.isInitialized = true;
            return false;
        }
    }

    // Load cooldowns from localStorage
    loadCooldowns() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            this.cooldowns = stored ? JSON.parse(stored) : {};
            
            // Clean up old entries (older than 25 hours)
            const now = Date.now();
            Object.keys(this.cooldowns).forEach(address => {
                if (now - this.cooldowns[address] > 25 * 3600000) {
                    delete this.cooldowns[address];
                }
            });
            this.saveCooldowns();
        } catch (error) {
            console.error('Error loading cooldowns:', error);
            this.cooldowns = {};
        }
    }

    // Save cooldowns to localStorage
    saveCooldowns() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cooldowns));
        } catch (error) {
            console.error('Error saving cooldowns:', error);
        }
    }

    getCooldownRemaining(address) {
        const lastClaim = this.cooldowns[address];
        if (!lastClaim) return 0;

        const timePassed = Date.now() - lastClaim;
        const cooldown = this.faucetConfig ? this.faucetConfig.cooldown : 86400000; // Default 24 hours
        const remaining = cooldown - timePassed;
        return Math.max(0, remaining);
    }

    canClaim(address) {
        const canClaim = this.getCooldownRemaining(address) === 0;
        console.log('Faucet cooldown check:', {
            address,
            lastClaim: this.cooldowns[address],
            remaining: this.formatCooldownTime(address),
            canClaim
        });
        return canClaim;
    }

    async claimTokens(toAddress) {
        try {
            // Initialize if not already
            const initialized = await this.init();
            if (!initialized) {
                throw new Error('Faucet not configured. Please contact administrator.');
            }

            console.log('Attempting to claim tokens for:', toAddress);
            console.log('Current cooldowns:', this.cooldowns);

            // Check cooldown
            if (!this.canClaim(toAddress)) {
                const remainingMs = this.getCooldownRemaining(toAddress);
                const hours = Math.floor(remainingMs / 3600000);
                const minutes = Math.floor((remainingMs % 3600000) / 60000);
                throw new Error(`Please wait ${hours}h ${minutes}m before claiming again`);
            }

            // Check if faucet is configured with private key
            if (!this.faucetConfig || !this.faucetConfig.privateKey) {
                throw new Error('Faucet is not configured. Please contact administrator.');
            }

            // Create provider and wallet
            const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
            const faucetWallet = new ethers.Wallet(this.faucetConfig.privateKey, provider);

            // Check faucet balance
            const balance = await provider.getBalance(faucetWallet.address);
            const amountToSend = ethers.parseEther(this.faucetConfig.amount);

            if (balance < amountToSend) {
                throw new Error('Faucet is empty. Please contact administrator.');
            }

            console.log(`Sending ${this.faucetConfig.amount} STT from faucet to ${toAddress}...`);

            // Send transaction
            const tx = await faucetWallet.sendTransaction({
                to: toAddress,
                value: amountToSend
            });

            console.log('Transaction sent:', tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Update cooldown and save to localStorage
            this.cooldowns[toAddress] = Date.now();
            this.saveCooldowns();

            console.log('✅ Cooldown updated and saved:', {
                address: toAddress,
                timestamp: this.cooldowns[toAddress],
                nextClaimIn: '24 hours'
            });

            return {
                success: true,
                message: `Successfully sent ${this.faucetConfig.amount} STT!`,
                txHash: tx.hash
            };
        } catch (error) {
            console.error('Faucet claim error:', error);
            throw error;
        }
    }

    formatCooldownTime(address) {
        const remainingMs = this.getCooldownRemaining(address);
        if (remainingMs === 0) return 'Ready';

        const hours = Math.floor(remainingMs / 3600000);
        const minutes = Math.floor((remainingMs % 3600000) / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }
}

// Singleton instance
const faucetService = new FaucetService();

export default faucetService;

