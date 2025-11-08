import { ethers } from 'ethers';
import walletManager from './wallet.js';
import pointsManager from './points.js';

class ContractManager {
    constructor() {
        // Real contract addresses from Somnia testnet
        this.contracts = {
            // Uniswap V2 Router on Somnia
            uniswapRouter: '0x8779b407ab9B91901df322B7d4226a3a059ABe76',
            // Tokos.fi Lending Pool on Somnia
            lendingPool: '0x29edCCDB3aE8CDF0ea6077cd3E682BfA6dD53f19',
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

        // aToken addresses (for lending pool)
        this.aTokens = {
            'WSTT': '0x0A197587EE751237FfBE555568d9485e467da2A3', // aToken for WSTT
            'STT': '0x0A197587EE751237FfBE555568d9485e467da2A3' // Same as WSTT
        };

        // Debt token addresses (for borrowing)
        this.debtTokens = {
            'WSTT': '0xCabad01fb6583C8ebA17BF1D3A7d0Fc36FE248ed', // Variable debt token for WSTT
            'STT': '0xCabad01fb6583C8ebA17BF1D3A7d0Fc36FE248ed' // Same as WSTT
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
            ],
            debtToken: [
                'function approveDelegation(address delegatee, uint256 amount) external',
                'function borrowAllowance(address fromUser, address toUser) external view returns (uint256)'
            ],
            lendingPool: [
                'function depositETH(address asset, address onBehalfOf, uint16 referralCode) external payable',
                'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
                'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
                'function withdraw(address asset, uint256 amount, address to) external returns (uint256)',
                'function withdrawETH(address asset, uint256 amount, address to) external returns (uint256)',
                'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external',
                'function borrowETH(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode) external payable',
                'function setUserUseReserveAsCollateral(address asset, bool useAsCollateral) external',
                'function getUserAccountData(address user) external view returns (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
                'function getReserveData(address asset) external view returns (tuple(address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))',
                'function getUserReserveData(address asset, address user) external view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)'
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

    // Get token balance for user
    async getTokenBalance(token) {
        try {
            if (!walletManager.isConnected) {
                return '0';
            }

            const userAddress = walletManager.getAddress();
            
            // For native STT
            if (token === 'STT' || token === 'WSTT') {
                const provider = walletManager.getProvider();
                const balance = await provider.getBalance(userAddress);
                return ethers.formatUnits(balance, 18);
            }
            
            // For ERC20 tokens
            const tokenAddress = this.tokens[token];
            if (!tokenAddress) {
                return '0';
            }

            const provider = walletManager.getProvider();
            const tokenContract = new ethers.Contract(
                tokenAddress,
                this.abis.erc20,
                provider
            );

            const balance = await tokenContract.balanceOf(userAddress);
            return ethers.formatUnits(balance, 18);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    // Lending Functions - Tokos.fi style (On-chain)
    async supplySTT(amount, useAsCollateral = true) {
        try {
            if (!walletManager.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            const signer = walletManager.getSigner();
            const userAddress = walletManager.getAddress();
            const lendingPoolAddress = this.contracts.lendingPool;
            const wsttAddress = this.tokens['WSTT'];

            // Convert amount to Wei (18 decimals)
            const amountIn = ethers.parseUnits(amount.toString(), 18);

            // Check native STT balance
            const balance = await signer.provider.getBalance(userAddress);
            if (balance < amountIn) {
                throw new Error('Insufficient STT balance');
            }

            console.log(`Supplying ${amount} STT using depositETH (collateral: ${useAsCollateral})...`);

            // Get lending pool contract
            const lendingPool = new ethers.Contract(
                lendingPoolAddress,
                this.abis.lendingPool,
                signer
            );

            // Step 1: Deposit native STT using depositETH
            // depositETH(address asset, address onBehalfOf, uint16 referralCode)
            // referralCode = 0 (no referral)
            console.log('Depositing native STT via depositETH...');
            console.log('Asset (WSTT):', wsttAddress);
            console.log('Amount:', ethers.formatUnits(amountIn, 18), 'STT');
            console.log('OnBehalfOf:', userAddress);
            console.log('Lending Pool Address:', lendingPoolAddress);
            
            // depositETH takes 3 parameters: asset, onBehalfOf, referralCode
            // value is sent in transaction options
            const tx = await lendingPool.depositETH(
                wsttAddress,  // asset (WSTT address)
                userAddress,  // onBehalfOf
                0,            // referralCode
                {
                    value: amountIn  // native STT amount
                }
            );

            console.log('Transaction sent:', tx.hash);
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.transactionHash);

            // Step 2: Set collateral if needed
            if (useAsCollateral) {
                try {
                    // Get WETH address (wrapped STT) for collateral
                    const setCollateralTx = await lendingPool.setUserUseReserveAsCollateral(
                        wsttAddress,
                        true
                    );
                    await setCollateralTx.wait();
                    console.log('Collateral enabled');
                } catch (collateralError) {
                    console.warn('Failed to set collateral:', collateralError);
                    // Continue anyway, deposit was successful
                }
            }

            // Award points
            pointsManager.addPoints(userAddress, 'lending');

            return {
                success: true,
                message: `Successfully supplied ${amount} STT!`,
                txHash: receipt.transactionHash
            };
        } catch (error) {
            console.error('Supply error:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                data: error.data,
                reason: error.reason
            });
            
            // User-friendly error messages
            if (error.message.includes('user rejected') || error.message.includes('User denied')) {
                throw new Error('Transaction rejected by user');
            } else if (error.message.includes('Fallback not allowed') || error.reason === 'Fallback not allowed') {
                // This means depositETH function might not exist or has wrong signature
                console.error('depositETH failed, error:', error);
                throw new Error('depositETH function call failed. Please check contract ABI.');
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to supply STT. Please try again.');
            }
        }
    }

    async borrowSTT(amount) {
        try {
            if (!walletManager.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            const signer = walletManager.getSigner();
            const userAddress = walletManager.getAddress();
            const lendingPoolAddress = this.contracts.lendingPool;
            const wsttAddress = this.tokens['WSTT'];

            // Convert amount to Wei (18 decimals)
            const amountIn = ethers.parseUnits(amount.toString(), 18);

            console.log(`Borrowing ${amount} STT...`);

            // Get lending pool contract
            const lendingPool = new ethers.Contract(
                lendingPoolAddress,
                this.abis.lendingPool,
                signer
            );

            // Check user account data (health factor, available borrows)
            try {
                const accountData = await lendingPool.getUserAccountData(userAddress);
                const availableBorrows = accountData.availableBorrowsETH;
                
                if (availableBorrows < amountIn) {
                    throw new Error('Insufficient collateral to borrow this amount');
                }
            } catch (checkError) {
                console.warn('Could not check account data:', checkError);
                // Continue anyway, contract will revert if insufficient
            }

            // Step 1: Approve delegation on debt token
            const debtTokenAddress = this.debtTokens['WSTT'];
            const debtToken = new ethers.Contract(
                debtTokenAddress,
                this.abis.debtToken,
                signer
            );

            console.log('Approving delegation on debt token...');
            
            // Check if delegation is already approved
            try {
                const currentAllowance = await debtToken.borrowAllowance(userAddress, lendingPoolAddress);
                if (currentAllowance < amountIn) {
                    // Approve delegation with max amount (type(uint256).max)
                    const maxAmount = ethers.MaxUint256;
                    const approveTx = await debtToken.approveDelegation(lendingPoolAddress, maxAmount);
                    console.log('Delegation approval transaction sent:', approveTx.hash);
                    await approveTx.wait();
                    console.log('Delegation approved');
                } else {
                    console.log('Delegation already approved');
                }
            } catch (approveError) {
                console.warn('Could not check/approve delegation, trying anyway:', approveError);
                // Try to approve anyway
                try {
                    const maxAmount = ethers.MaxUint256;
                    const approveTx = await debtToken.approveDelegation(lendingPoolAddress, maxAmount);
                    console.log('Delegation approval transaction sent:', approveTx.hash);
                    await approveTx.wait();
                    console.log('Delegation approved');
                } catch (approveError2) {
                    console.error('Failed to approve delegation:', approveError2);
                    throw new Error('Failed to approve delegation. Please try again.');
                }
            }

            // Step 2: Borrow STT using borrowETH
            // interestRateMode: 2 = variable rate (1 = stable rate)
            // referralCode = 0 (no referral)
            // borrowETH signature: borrowETH(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode)
            console.log('Borrowing STT using borrowETH...');
            const tx = await lendingPool.borrowETH(
                wsttAddress,  // asset (WSTT)
                amountIn,     // amount
                2,            // interestRateMode (variable)
                0             // referralCode
            );

            console.log('Transaction sent:', tx.hash);
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.transactionHash);

            // Award points
            pointsManager.addPoints(userAddress, 'lending');

            return {
                success: true,
                message: `Successfully borrowed ${amount} STT!`,
                txHash: receipt.transactionHash
            };
        } catch (error) {
            console.error('Borrow error:', error);
            
            // User-friendly error messages
            if (error.message.includes('insufficient collateral') || 
                error.message.includes('health factor')) {
                throw new Error('Insufficient collateral to borrow this amount');
            } else if (error.message.includes('user rejected')) {
                throw new Error('Transaction rejected by user');
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to borrow STT. Please check your collateral.');
            }
        }
    }

    async withdrawSTT(amount) {
        try {
            if (!walletManager.isConnected) {
                throw new Error('Please connect your wallet first');
            }

            const signer = walletManager.getSigner();
            const userAddress = walletManager.getAddress();
            const lendingPoolAddress = this.contracts.lendingPool;
            const wsttAddress = this.tokens['WSTT'];

            // Convert amount to Wei (18 decimals)
            const amountIn = ethers.parseUnits(amount.toString(), 18);

            console.log(`Withdrawing ${amount} STT...`);

            // Get lending pool contract
            const lendingPool = new ethers.Contract(
                lendingPoolAddress,
                this.abis.lendingPool,
                signer
            );

            // Withdraw STT using withdrawETH (for native STT)
            // Try withdrawETH first, if it fails, try withdraw
            let tx;
            try {
                tx = await lendingPool.withdrawETH(
                    wsttAddress,  // asset (WSTT)
                    amountIn,     // amount
                    userAddress   // to (user address)
                );
                console.log('Using withdrawETH() function');
            } catch (withdrawETHError) {
                console.log('withdrawETH failed, trying withdraw()...');
                // Fallback to withdraw() function
                tx = await lendingPool.withdraw(
                    wsttAddress,  // asset (WSTT)
                    amountIn,     // amount
                    userAddress   // to (user address)
                );
                console.log('Using withdraw() function');
            }

            console.log('Transaction sent:', tx.hash);
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.transactionHash);

            // Award points
            pointsManager.addPoints(userAddress, 'lending');

            return {
                success: true,
                message: `Successfully withdrew ${amount} STT!`,
                txHash: receipt.transactionHash
            };
        } catch (error) {
            console.error('Withdraw error:', error);
            
            // User-friendly error messages
            if (error.message.includes('user rejected') || error.message.includes('User denied')) {
                throw new Error('Transaction rejected by user');
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to withdraw STT. Please try again.');
            }
        }
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

