import { ethers } from 'ethers';
import walletManager from './wallet.js';
import pointsManager from './points.js';

class ContractManager {
    constructor() {
        // Real contract addresses from Somnia testnet
        this.contracts = {
            // Uniswap V2 Router on Somnia
            uniswapRouter: '0x8779b407ab9B91901df322B7d4226a3a059ABe76',
            faucet: '0x0000000000000000000000000000000000000000', // To be updated
            nft: '0x0000000000000000000000000000000000000000', // To be updated
            staking: '0x0000000000000000000000000000000000000000' // To be updated
        };

        // Token addresses on Somnia testnet
        this.tokens = {
            'WSTT': '0xF22eF0085f6511f70b01a68F360dCc56261F768a', // Wrapped STT
            'STT': '0xF22eF0085f6511f70b01a68F360dCc56261F768a', // Same as WSTT for UI
            'USDT': '0xDa4FDE38bE7a2b959BF46E032ECfA21e64019b76', // USDT.g
            'USDC': '0x0000000000000000000000000000000000000000', // To be added
            'DAI': '0x0000000000000000000000000000000000000000' // To be added
        };

        // Uniswap V2 Router ABI (only methods we need)
        this.abis = {
            uniswapRouter: [
                'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
                'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
                'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
                'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
                'function WETH() external pure returns (address)'
            ],
            erc20: [
                'function approve(address spender, uint256 amount) external returns (bool)',
                'function allowance(address owner, address spender) external view returns (uint256)',
                'function balanceOf(address account) external view returns (uint256)',
                'function decimals() external view returns (uint8)'
            ]
        };
    }

    // Faucet Functions
    async claimFaucet() {
        try {
            if (!walletManager.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            // Mock implementation - simulate transaction
            console.log('Claiming tokens from faucet...');
            
            // Simulate delay
            await this.simulateTransaction();

            // Award points
            const address = walletManager.getAddress();
            pointsManager.addPoints(address, 'faucet');

            return {
                success: true,
                message: 'Successfully claimed 100 STT test tokens!',
                txHash: '0x' + Math.random().toString(16).substring(2, 66)
            };
        } catch (error) {
            console.error('Faucet claim error:', error);
            throw error;
        }
    }

    // Swap Functions - Real Uniswap V2 Implementation
    async swapTokens(fromToken, toToken, amount) {
        try {
            if (!walletManager.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            const signer = walletManager.getSigner();
            const userAddress = walletManager.getAddress();

            // Get token addresses
            const tokenInAddress = this.tokens[fromToken];
            const tokenOutAddress = this.tokens[toToken];

            if (!tokenInAddress || !tokenOutAddress) {
                throw new Error('Token not supported');
            }

            console.log(`Swapping ${amount} ${fromToken} to ${toToken}...`);

            // Convert amount to Wei (18 decimals)
            const amountIn = ethers.parseUnits(amount.toString(), 18);

            // Check balance
            if (fromToken === 'STT' || fromToken === 'WSTT') {
                // Check native STT balance
                const balance = await signer.provider.getBalance(userAddress);
                console.log('STT Balance:', ethers.formatUnits(balance, 18));
                if (balance < amountIn) {
                    throw new Error('Insufficient STT balance');
                }
            } else {
                // Check ERC20 token balance
                const tokenContract = new ethers.Contract(
                    tokenInAddress,
                    this.abis.erc20,
                    signer
                );
                const balance = await tokenContract.balanceOf(userAddress);
                console.log(`${fromToken} Balance:`, ethers.formatUnits(balance, 18));
                if (balance < amountIn) {
                    throw new Error(`Insufficient ${fromToken} balance`);
                }
            }

            // Get router contract
            const routerContract = new ethers.Contract(
                this.contracts.uniswapRouter,
                this.abis.uniswapRouter,
                signer
            );

            // Get quote to calculate minimum output (10% slippage tolerance for safety)
            const quote = await this.getSwapQuote(fromToken, toToken, amount);
            const minAmountOut = ethers.parseUnits(
                (parseFloat(quote.outputAmount) * 0.90).toFixed(18),
                18
            );
            
            console.log('Swap details:', {
                amountIn: ethers.formatUnits(amountIn, 18),
                expectedOut: quote.outputAmount,
                minAmountOut: ethers.formatUnits(minAmountOut, 18),
                slippage: '10%'
            });

            // Set deadline (10 minutes from now)
            const deadline = Math.floor(Date.now() / 1000) + 600;

            // Path for swap
            const path = [tokenInAddress, tokenOutAddress];

            let swapTx;

            // Check if we're swapping FROM native STT
            if (fromToken === 'STT' || fromToken === 'WSTT') {
                // STT → Token swap (use native STT)
                console.log('Swapping native STT to token...');
                swapTx = await routerContract.swapExactETHForTokens(
                    minAmountOut,
                    path,
                    userAddress,
                    deadline,
                    { value: amountIn } // Send STT as value
                );
            } 
            // Check if we're swapping TO native STT
            else if (toToken === 'STT' || toToken === 'WSTT') {
                // Token → STT swap
                console.log('Swapping token to native STT...');
                
                // Step 1: Approve token
                const tokenContract = new ethers.Contract(
                    tokenInAddress,
                    this.abis.erc20,
                    signer
                );

                const currentAllowance = await tokenContract.allowance(
                    userAddress,
                    this.contracts.uniswapRouter
                );

                if (currentAllowance < amountIn) {
                    console.log('Approving token...');
                    const approveTx = await tokenContract.approve(
                        this.contracts.uniswapRouter,
                        amountIn
                    );
                    await approveTx.wait();
                }

                // Step 2: Swap
                swapTx = await routerContract.swapExactTokensForETH(
                    amountIn,
                    minAmountOut,
                    path,
                    userAddress,
                    deadline
                );
            }
            // Token to Token swap (both are ERC20)
            else {
                // Step 1: Approve token
                console.log('Approving token...');
                const tokenContract = new ethers.Contract(
                    tokenInAddress,
                    this.abis.erc20,
                    signer
                );

                const currentAllowance = await tokenContract.allowance(
                    userAddress,
                    this.contracts.uniswapRouter
                );

                if (currentAllowance < amountIn) {
                    const approveTx = await tokenContract.approve(
                        this.contracts.uniswapRouter,
                        amountIn
                    );
                    await approveTx.wait();
                }

                // Step 2: Execute swap
                console.log('Executing token-to-token swap...');
                swapTx = await routerContract.swapExactTokensForTokens(
                    amountIn,
                    minAmountOut,
                    path,
                    userAddress,
                    deadline
                );
            }

            console.log('Swap transaction sent:', swapTx.hash);
            const receipt = await swapTx.wait();
            console.log('Swap confirmed!', receipt);

            // Award points
            pointsManager.addPoints(userAddress, 'swap');

            return {
                success: true,
                message: `Successfully swapped ${amount} ${fromToken} to ${toToken}!`,
                txHash: swapTx.hash
            };
        } catch (error) {
            console.error('Swap error:', error);
            
            // User-friendly error messages
            if (error.code === 'ACTION_REJECTED') {
                throw new Error('Transaction rejected by user');
            } else if (error.message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
                throw new Error('Insufficient output amount - try increasing slippage');
            } else if (error.message.includes('INSUFFICIENT_INPUT_AMOUNT')) {
                throw new Error('Insufficient input amount');
            } else if (error.message.includes('insufficient funds')) {
                throw new Error('Insufficient balance');
            } else {
                throw new Error(error.reason || error.message || 'Swap failed');
            }
        }
    }

    async getSwapQuote(fromToken, toToken, amount) {
        try {
            // Get token addresses
            const tokenInAddress = this.tokens[fromToken];
            const tokenOutAddress = this.tokens[toToken];

            if (!tokenInAddress || !tokenOutAddress) {
                throw new Error('Token not supported');
            }

            // Check if tokens are actually different
            if (tokenInAddress === tokenOutAddress) {
                throw new Error('Cannot swap same token');
            }

            // Create public provider for Somnia network
            let provider;
            if (walletManager.isConnected) {
                provider = walletManager.getProvider();
            } else {
                // Use public RPC for quote (read-only)
                provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
            }
            
            // Get router contract
            const routerContract = new ethers.Contract(
                this.contracts.uniswapRouter,
                this.abis.uniswapRouter,
                provider
            );

            // Convert amount to Wei
            const amountIn = ethers.parseUnits(amount.toString(), 18);

            // Path for swap - same logic as swapTokens
            const path = [tokenInAddress, tokenOutAddress];

            console.log('Getting quote for:', {
                fromToken,
                toToken,
                amount,
                path
            });

            try {
                // Try to get amounts out from router
                const amounts = await routerContract.getAmountsOut(amountIn, path);
                console.log('Quote received:', amounts);

                // amounts[0] = input amount, amounts[1] = output amount
                const outputAmount = ethers.formatUnits(amounts[1], 18);
                const rate = (parseFloat(outputAmount) / parseFloat(amount)).toFixed(4);
                const feeAmount = parseFloat(amount) * 0.003;

                return {
                    fromToken,
                    toToken,
                    inputAmount: amount,
                    outputAmount: parseFloat(outputAmount).toFixed(4),
                    rate,
                    priceImpact: '< 0.5%',
                    fee: feeAmount.toFixed(4)
                };
            } catch (routerError) {
                console.warn('Router quote failed, using estimated rate:', routerError.message);
                
                // Fallback: Use a conservative estimated rate
                // For STT/USDT pair, use approximate market rate (very conservative)
                let estimatedRate = 1.0;
                
                if ((fromToken === 'STT' || fromToken === 'WSTT') && toToken === 'USDT') {
                    // STT → USDT: Based on successful tx, ~0.1 STT → ~0.354 USDT
                    // Use conservative rate (rate: 3.54, but we use 3.2 to be safe)
                    estimatedRate = 3.2;
                } else if (fromToken === 'USDT' && (toToken === 'STT' || toToken === 'WSTT')) {
                    // USDT → STT: Based on successful tx, 1 USDT → 0.2793 STT
                    // Use very conservative rate (20% lower than actual)
                    estimatedRate = 0.25;
                }

                const outputAmount = (parseFloat(amount) * estimatedRate * 0.997).toFixed(4); // 0.3% fee
                const feeAmount = (parseFloat(amount) * 0.003).toFixed(4);

                return {
                    fromToken,
                    toToken,
                    inputAmount: amount,
                    outputAmount,
                    rate: estimatedRate.toFixed(4),
                    priceImpact: '< 10%',
                    fee: feeAmount,
                    estimated: true
                };
            }
        } catch (error) {
            console.error('Quote error details:', error);
            throw new Error('Failed to get quote: ' + (error.reason || error.message || 'Unknown error'));
        }
    }

    // NFT Functions
    async mintNFT(nftId) {
        try {
            if (!walletManager.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            console.log(`Minting NFT #${nftId}...`);

            // Mock implementation
            await this.simulateTransaction();

            // Award points
            const address = walletManager.getAddress();
            pointsManager.addPoints(address, 'nft');

            return {
                success: true,
                message: `Successfully minted NFT #${nftId}!`,
                txHash: '0x' + Math.random().toString(16).substring(2, 66),
                tokenId: nftId
            };
        } catch (error) {
            console.error('NFT mint error:', error);
            throw error;
        }
    }

    getNFTCollection() {
        // Mock NFT collection
        return [
            {
                id: 1,
                name: 'Somnia Genesis #1',
                description: 'The first NFT in the SomiVerse collection',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNncmFkKSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGMDA4MDsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEQ0RkY7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPiMxPC90ZXh0Pjwvc3ZnPg==',
                price: '0.1 STT'
            },
            {
                id: 2,
                name: 'Somnia Genesis #2',
                description: 'The second NFT in the SomiVerse collection',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNncmFkKSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhCNUNGNjsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRjAwODA7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPiMyPC90ZXh0Pjwvc3ZnPg==',
                price: '0.1 STT'
            },
            {
                id: 3,
                name: 'Somnia Genesis #3',
                description: 'The third NFT in the SomiVerse collection',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNncmFkKSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwRDRGRjsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPiMzPC90ZXh0Pjwvc3ZnPg==',
                price: '0.1 STT'
            }
        ];
    }

    // Staking Functions
    async stakeTokens(amount) {
        try {
            if (!walletManager.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            console.log(`Staking ${amount} STT...`);

            // Mock implementation
            await this.simulateTransaction();

            // Award points
            const address = walletManager.getAddress();
            pointsManager.addPoints(address, 'staking');

            return {
                success: true,
                message: `Successfully staked ${amount} STT!`,
                txHash: '0x' + Math.random().toString(16).substring(2, 66)
            };
        } catch (error) {
            console.error('Staking error:', error);
            throw error;
        }
    }

    async unstakeTokens(amount) {
        try {
            if (!walletManager.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            console.log(`Unstaking ${amount} STT...`);

            // Mock implementation
            await this.simulateTransaction();

            return {
                success: true,
                message: `Successfully unstaked ${amount} STT!`,
                txHash: '0x' + Math.random().toString(16).substring(2, 66)
            };
        } catch (error) {
            console.error('Unstaking error:', error);
            throw error;
        }
    }

    getStakingInfo() {
        // Mock staking info
        return {
            totalStaked: '1000',
            userStaked: '0',
            apy: '25%',
            rewards: '0',
            lockPeriod: '7 days'
        };
    }

    // Utility function to simulate transaction
    async simulateTransaction() {
        return new Promise(resolve => {
            setTimeout(resolve, 1500); // Simulate 1.5s transaction time
        });
    }

    // Update contract addresses after deployment
    updateContractAddress(type, address) {
        this.contracts[type] = address;
    }
}

// Singleton instance
const contractManager = new ContractManager();

export default contractManager;

