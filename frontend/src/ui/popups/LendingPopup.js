import { ethers } from 'ethers';
import contractManager from '../../web3/contracts.js';
import walletManager from '../../web3/wallet.js';
import pointsManager from '../../web3/points.js';
import toastManager from '../../utils/ToastManager.js';

export default class LendingPopup {
    constructor() {
        this.isSupplying = false;
        this.isBorrowing = false;
        this.isWithdrawing = false;
        this.isRepaying = false;
        this.currentMode = 'supply'; // 'supply' or 'borrow'
        this.walletBalance = '0';
        this.suppliedBalance = '0';
        this.borrowedBalance = '0';
        this.availableBorrow = '0';
        this.healthFactor = 0;
        this.netWorth = '0';
        this.netApy = '0.16';
        this.supplyApy = '0.16';
        this.borrowApy = '1.69';
        this.collateralEnabled = true;
        this.unwrapWSTT = true;
    }

    render(title) {
        const reward = pointsManager.getReward('lending');
        
        return `
            <div class="popup-header">
                <h2 class="popup-title">${title}</h2>
                <button class="close-btn" id="close-popup">&times;</button>
            </div>
            
            <!-- Mode Tabs -->
            <div style="display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <button id="supply-tab" class="mode-tab ${this.currentMode === 'supply' ? 'active' : ''}" style="flex: 1; padding: 12px 20px; background: ${this.currentMode === 'supply' ? 'rgba(255, 0, 128, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${this.currentMode === 'supply' ? 'rgba(255, 0, 128, 0.4)' : 'rgba(255, 255, 255, 0.2)'}; border-bottom: none; border-radius: 12px 12px 0 0; color: ${this.currentMode === 'supply' ? '#FF0080' : 'white'}; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s;">
                    Supply
                </button>
                <button id="borrow-tab" class="mode-tab ${this.currentMode === 'borrow' ? 'active' : ''}" style="flex: 1; padding: 12px 20px; background: ${this.currentMode === 'borrow' ? 'rgba(255, 0, 128, 0.2)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${this.currentMode === 'borrow' ? 'rgba(255, 0, 128, 0.4)' : 'rgba(255, 255, 255, 0.2)'}; border-bottom: none; border-radius: 12px 12px 0 0; color: ${this.currentMode === 'borrow' ? '#FF0080' : 'white'}; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s;">
                    Borrow
                </button>
            </div>
            
            <div class="popup-body" style="max-height: 80vh; overflow-y: auto;">
                <!-- Net Worth & Net APY -->
                <div style="display: flex; gap: 30px; margin-bottom: 30px; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
                    <div style="flex: 1;">
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-bottom: 8px;">Net worth</div>
                        <div style="font-size: 28px; font-weight: 700; color: white;" id="net-worth">$0.00</div>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                            Net APY
                            <span style="font-size: 14px; opacity: 0.6;">ⓘ</span>
                        </div>
                        <div style="font-size: 28px; font-weight: 700; color: white;" id="net-apy">0.16%</div>
                    </div>
                </div>

                <!-- Supply Content -->
                <div id="supply-content" style="display: ${this.currentMode === 'supply' ? 'block' : 'none'};">
                <!-- Your Supplies Section -->
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="font-size: 18px; font-weight: 700; color: white; margin: 0;">Your supplies</h3>
                        <button id="hide-supplies" style="background: none; border: none; color: rgba(255, 255, 255, 0.7); cursor: pointer; font-size: 14px;">Hide —</button>
                    </div>
                    
                    <!-- Summary Metrics -->
                    <div style="display: flex; gap: 20px; margin-bottom: 15px; padding: 15px; background: rgba(255, 255, 255, 0.03); border-radius: 10px;">
                        <div>
                            <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Balance </span>
                            <span style="color: white; font-weight: 700; font-size: 16px;" id="supplied-balance">$0.00</span>
                        </div>
                        <div>
                            <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">APY </span>
                            <span style="color: white; font-weight: 700; font-size: 16px;" id="supplied-apy">0.16%</span>
                            <span style="font-size: 12px; opacity: 0.6; margin-left: 4px;">ⓘ</span>
                        </div>
                        <div>
                            <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Collateral </span>
                            <span style="color: white; font-weight: 700; font-size: 16px;" id="collateral-balance">$0.00</span>
                            <span style="font-size: 12px; opacity: 0.6; margin-left: 4px;">ⓘ</span>
                        </div>
                    </div>

                    <!-- Your Supplies Table -->
                    <div id="your-supplies-table" style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                    <th style="padding: 15px; text-align: left; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Asset</th>
                                    <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Balance</th>
                                    <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">APY</th>
                                    <th style="padding: 15px; text-align: center; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Collateral</th>
                                    <th style="padding: 15px; text-align: center; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="your-supplies-body">
                                <!-- Will be populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Assets to Supply Section -->
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="font-size: 18px; font-weight: 700; color: white; margin: 0;">Assets to supply</h3>
                        <button id="hide-assets" style="background: none; border: none; color: rgba(255, 255, 255, 0.7); cursor: pointer; font-size: 14px;">Hide —</button>
                    </div>
                    
                    <!-- Options -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; gap: 8px; color: white; cursor: pointer;">
                            <input type="checkbox" id="show-zero-balance" style="width: 16px; height: 16px; cursor: pointer;">
                            <span style="font-size: 14px;">Show assets with 0 balance</span>
                        </label>
                        <a href="https://shannon-explorer.somnia.network" target="_blank" style="color: #00D4FF; text-decoration: none; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                            <span>SOMNIA TESTNET FAUCET</span>
                            <span style="font-size: 12px;">↗</span>
                        </a>
                    </div>

                    <!-- Assets to Supply Table -->
                    <div id="assets-to-supply-table" style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                    <th style="padding: 15px; text-align: left; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Assets</th>
                                    <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Wallet balance</th>
                                    <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">APY</th>
                                    <th style="padding: 15px; text-align: center; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Can be collateral</th>
                                    <th style="padding: 15px; text-align: center; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="assets-to-supply-body">
                                <!-- Will be populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>

                <!-- Borrow Content -->
                <div id="borrow-content" style="display: ${this.currentMode === 'borrow' ? 'block' : 'none'};">
                    <!-- Your Borrows Section -->
                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <h3 style="font-size: 18px; font-weight: 700; color: white; margin: 0;">Your borrows</h3>
                                <div style="display: flex; align-items: center; gap: 8px; padding: 4px 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                                    <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">E-Mode</span>
                                    <span style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">DISABLED</span>
                                    <span style="font-size: 14px;">⚡</span>
                                </div>
                            </div>
                            <button id="hide-borrows" style="background: none; border: none; color: rgba(255, 255, 255, 0.7); cursor: pointer; font-size: 14px;">Hide —</button>
                        </div>
                        
                        <!-- Summary Metrics -->
                        <div style="display: flex; gap: 20px; margin-bottom: 15px; padding: 15px; background: rgba(255, 255, 255, 0.03); border-radius: 10px;">
                            <div>
                                <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Balance </span>
                                <span style="color: white; font-weight: 700; font-size: 16px;" id="borrowed-balance">$0.00</span>
                            </div>
                            <div>
                                <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">APY </span>
                                <span style="color: white; font-weight: 700; font-size: 16px;" id="borrowed-apy">1.69%</span>
                                <span style="font-size: 12px; opacity: 0.6; margin-left: 4px;">ⓘ</span>
                            </div>
                            <div>
                                <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Borrow power used </span>
                                <span style="color: white; font-weight: 700; font-size: 16px;" id="borrow-power-used">0%</span>
                                <span style="font-size: 12px; opacity: 0.6; margin-left: 4px;">ⓘ</span>
                            </div>
                        </div>

                        <!-- Your Borrows Table -->
                        <div id="your-borrows-table" style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; overflow: hidden;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                        <th style="padding: 15px; text-align: left; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">
                                            <div style="display: flex; align-items: center; gap: 6px;">
                                                Asset
                                                <span style="font-size: 12px; opacity: 0.5;">⇅</span>
                                            </div>
                                        </th>
                                        <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">
                                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                                                Debt
                                                <span style="font-size: 12px; opacity: 0.5;">⇅</span>
                                            </div>
                                        </th>
                                        <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">
                                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                                                APY
                                                <span style="font-size: 12px; opacity: 0.5;">⇅</span>
                                            </div>
                                        </th>
                                        <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">
                                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                                                APY type
                                                <span style="font-size: 12px; opacity: 0.5;">⇅</span>
                                            </div>
                                        </th>
                                        <th style="padding: 15px; text-align: center; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="your-borrows-body">
                                    <!-- Will be populated dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Assets to Borrow Section -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="font-size: 18px; font-weight: 700; color: white; margin: 0;">Assets to borrow</h3>
                            <button id="hide-borrow-assets" style="background: none; border: none; color: rgba(255, 255, 255, 0.7); cursor: pointer; font-size: 14px;">Hide —</button>
                        </div>
                        
                        <!-- Assets to Borrow Table -->
                        <div id="assets-to-borrow-table" style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; overflow: hidden;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                        <th style="padding: 15px; text-align: left; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">
                                            <div style="display: flex; align-items: center; gap: 6px;">
                                                Asset
                                                <span style="font-size: 12px; opacity: 0.5;">⇅</span>
                                            </div>
                                        </th>
                                        <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">
                                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                                                Available
                                                <span style="font-size: 12px; opacity: 0.6; margin-left: 4px;">ⓘ</span>
                                                <span style="font-size: 12px; opacity: 0.5;">⇅</span>
                                            </div>
                                        </th>
                                        <th style="padding: 15px; text-align: right; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">
                                            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                                                APY, variable
                                                <span style="font-size: 12px; opacity: 0.6; margin-left: 4px;">ⓘ</span>
                                                <span style="font-size: 12px; opacity: 0.5;">⇅</span>
                                            </div>
                                        </th>
                                        <th style="padding: 15px; text-align: center; color: rgba(255, 255, 255, 0.7); font-weight: 600; font-size: 14px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="assets-to-borrow-body">
                                    <!-- Will be populated dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Supply Modal (hidden by default) -->
                <div id="supply-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; align-items: center; justify-content: center;">
                    <div style="background: rgba(15, 20, 46, 0.95); border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; border: 1px solid rgba(255, 0, 128, 0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="font-size: 20px; font-weight: 700; color: white; margin: 0;">Supply STT</h3>
                            <button id="close-supply-modal" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
                        </div>

                        <!-- Supply Form -->
                        <div id="supply-form" class="lending-form">
                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label class="form-label" style="margin: 0;">Amount</label>
                            <span style="font-size: 12px; opacity: 0.7;">Balance: <span id="supply-balance">Loading...</span></span>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <input type="number" class="form-input" id="supply-amount" placeholder="0.0" style="flex: 2;" value="1" step="0.000001">
                            <div style="flex: 1; display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px;">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #FF0080, #00D4FF);"></div>
                                <span style="color: white; font-weight: 600;">STT</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                            <button class="percentage-btn" data-percentage="25" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">25%</button>
                            <button class="percentage-btn" data-percentage="50" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">50%</button>
                            <button class="percentage-btn" data-percentage="75" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">75%</button>
                            <button class="percentage-btn" data-percentage="100" style="flex: 1; padding: 6px; background: rgba(255, 0, 128, 0.2); border: 1px solid rgba(255, 0, 128, 0.4); border-radius: 6px; color: #FF0080; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">MAX</button>
                        </div>
                    </div>

                    <!-- Transaction Overview -->
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                        <div style="font-weight: 600; margin-bottom: 12px; color: white;">Transaction overview</div>
                        <div class="info-row" style="background: transparent; padding: 8px 0;">
                            <span class="info-label">Supply APY:</span>
                            <span class="info-value" style="color: #4ade80;">${this.apy}%</span>
                        </div>
                        <div class="info-row" style="background: transparent; padding: 8px 0;">
                            <span class="info-label">Collateralization:</span>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="collateral-toggle" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span style="color: #4ade80; font-weight: 600;">Enabled</span>
                            </label>
                        </div>
                    </div>

                    <!-- Gas Fee -->
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; font-size: 14px; opacity: 0.7;">
                        <span>⛽</span>
                        <span>Gas fee: ~$0.90</span>
                    </div>

                            <button class="action-button" id="supply-btn">
                                Supply STT
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Withdraw Modal (hidden by default) -->
                <div id="withdraw-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; align-items: center; justify-content: center;">
                    <div style="background: rgba(15, 20, 46, 0.95); border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; border: 1px solid rgba(255, 0, 128, 0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="font-size: 20px; font-weight: 700; color: white; margin: 0;">Withdraw STT</h3>
                            <button id="close-withdraw-modal" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
                        </div>

                        <!-- Withdraw Form -->
                        <div id="withdraw-form" class="lending-form">
                            <div class="form-group">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <label class="form-label" style="margin: 0;">Amount</label>
                                    <span style="font-size: 12px; opacity: 0.7;">Supplied: <span id="withdraw-supplied">0 STT</span></span>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <input type="number" class="form-input" id="withdraw-amount" placeholder="0.0" style="flex: 2;" value="0" step="0.000001">
                                    <div style="flex: 1; display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px;">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #FF0080, #00D4FF);"></div>
                                        <span style="color: white; font-weight: 600;">STT</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px; margin-top: 8px;">
                                    <button class="percentage-btn" data-percentage="25" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">25%</button>
                                    <button class="percentage-btn" data-percentage="50" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">50%</button>
                                    <button class="percentage-btn" data-percentage="75" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">75%</button>
                                    <button class="percentage-btn" data-percentage="100" style="flex: 1; padding: 6px; background: rgba(255, 0, 128, 0.2); border: 1px solid rgba(255, 0, 128, 0.4); border-radius: 6px; color: #FF0080; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">MAX</button>
                                </div>
                            </div>

                            <!-- Gas Fee -->
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; font-size: 14px; opacity: 0.7;">
                                <span>⛽</span>
                                <span>Gas fee: ~$0.90</span>
                            </div>

                            <button class="action-button" id="withdraw-btn">
                                Withdraw STT
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Borrow Modal (hidden by default) -->
                <div id="borrow-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; align-items: center; justify-content: center;">
                    <div style="background: rgba(15, 20, 46, 0.95); border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; border: 1px solid rgba(255, 0, 128, 0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="font-size: 20px; font-weight: 700; color: white; margin: 0;">Borrow STT</h3>
                            <button id="close-borrow-modal" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
                        </div>

                        <!-- Borrow Form -->
                        <div id="borrow-form" class="lending-form">
                            <div class="form-group">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <label class="form-label" style="margin: 0; display: flex; align-items: center; gap: 6px;">
                                        Amount
                                        <span style="font-size: 14px; opacity: 0.6;">ⓘ</span>
                                    </label>
                                </div>
                                <div style="position: relative;">
                                    <input type="number" class="form-input" id="borrow-amount" placeholder="0.00" style="width: 100%; padding: 20px 120px 20px 20px; font-size: 24px; font-weight: 600; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: white;" value="" step="0.000001">
                                    <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px;">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #FF0080, #00D4FF);"></div>
                                        <span style="color: white; font-weight: 600;">STT</span>
                                    </div>
                                </div>
                                <div style="margin-top: 8px; padding: 0 4px;">
                                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin-bottom: 4px;" id="borrow-usd-value">$0</div>
                                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                                        Available <span id="borrow-available" style="color: white; font-weight: 600;">0 STT</span> MAX
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px; margin-top: 12px;">
                                    <button class="percentage-btn-borrow" data-percentage="25" style="flex: 1; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;">25%</button>
                                    <button class="percentage-btn-borrow" data-percentage="50" style="flex: 1; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;">50%</button>
                                    <button class="percentage-btn-borrow" data-percentage="75" style="flex: 1; padding: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;">75%</button>
                                    <button class="percentage-btn-borrow" data-percentage="100" style="flex: 1; padding: 8px; background: rgba(255, 0, 128, 0.2); border: 1px solid rgba(255, 0, 128, 0.4); border-radius: 8px; color: #FF0080; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;">MAX</button>
                                </div>
                            </div>

                            <!-- Unwrap WSTT Toggle -->
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: 10px; margin-bottom: 15px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
                                    <input type="checkbox" id="unwrap-wstt-toggle" checked style="width: 44px; height: 24px; appearance: none; background: rgba(255, 255, 255, 0.2); border-radius: 12px; position: relative; cursor: pointer; transition: all 0.3s;">
                                    <span style="color: white; font-size: 14px; font-weight: 500;">Unwrap WSTT (to borrow STT)</span>
                                </label>
                            </div>

                            <!-- Transaction Overview -->
                            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                                <div style="font-weight: 600; margin-bottom: 12px; color: white;">Transaction overview</div>
                                <div class="info-row" style="background: transparent; padding: 8px 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                        <span class="info-label">Health factor:</span>
                                        <div style="text-align: right;">
                                            <span class="info-value" style="color: #4ade80; font-weight: 600; font-size: 16px;" id="borrow-health-factor">-</span>
                                            <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px;">Liquidation at &lt;1.0</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Gas Fee -->
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; font-size: 14px; color: rgba(255, 255, 255, 0.7);">
                                <span style="font-size: 18px;">⛽</span>
                                <span>$1.35</span>
                                <span style="font-size: 12px; opacity: 0.6; margin-left: 4px;">ⓘ</span>
                            </div>

                            <!-- Attention Message -->
                            <div style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 10px; padding: 12px; margin-bottom: 15px;">
                                <div style="display: flex; align-items: start; gap: 10px;">
                                    <span style="font-size: 16px; opacity: 0.8;">ⓘ</span>
                                    <div style="flex: 1; color: rgba(255, 255, 255, 0.9); font-size: 13px; line-height: 1.5;">
                                        Attention: Parameter changes via governance can alter your account health factor and risk of liquidation. Follow the <a href="#" style="color: #60a5fa; text-decoration: underline;">governance forum</a> for updates.
                                    </div>
                                </div>
                            </div>

                            <button class="action-button" id="borrow-btn" style="width: 100%; padding: 14px; font-size: 16px; font-weight: 600; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: rgba(255, 255, 255, 0.5); cursor: not-allowed;" disabled>
                                Enter an amount
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Repay Modal (hidden by default) -->
                <div id="repay-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; align-items: center; justify-content: center;">
                    <div style="background: rgba(15, 20, 46, 0.95); border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; border: 1px solid rgba(255, 0, 128, 0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="font-size: 20px; font-weight: 700; color: white; margin: 0;">Repay STT</h3>
                            <button id="close-repay-modal" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
                        </div>

                        <!-- Repay Form -->
                        <div id="repay-form" class="lending-form">
                            <div class="form-group">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <label class="form-label" style="margin: 0;">Amount</label>
                                    <span style="font-size: 12px; opacity: 0.7;">Borrowed: <span id="repay-borrowed">0 STT</span></span>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <input type="number" class="form-input" id="repay-amount" placeholder="0.0" style="flex: 2;" value="0" step="0.000001">
                                    <div style="flex: 1; display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px;">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #FF0080, #00D4FF);"></div>
                                        <span style="color: white; font-weight: 600;">STT</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px; margin-top: 8px;">
                                    <button class="percentage-btn-repay" data-percentage="25" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">25%</button>
                                    <button class="percentage-btn-repay" data-percentage="50" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">50%</button>
                                    <button class="percentage-btn-repay" data-percentage="75" style="flex: 1; padding: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">75%</button>
                                    <button class="percentage-btn-repay" data-percentage="100" style="flex: 1; padding: 6px; background: rgba(255, 0, 128, 0.2); border: 1px solid rgba(255, 0, 128, 0.4); border-radius: 6px; color: #FF0080; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">MAX</button>
                                </div>
                            </div>

                            <!-- Gas Fee -->
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; font-size: 14px; opacity: 0.7;">
                                <span>⛽</span>
                                <span>Gas fee: ~$0.90</span>
                            </div>

                            <button class="action-button" id="repay-btn">
                                Repay STT
                            </button>
                        </div>
                    </div>
                </div>

                <div id="result-message" style="margin-top: 15px; padding: 12px; border-radius: 8px; display: none;"></div>
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('close-popup')?.addEventListener('click', () => {
            this.close();
        });

        // Tab switching
        document.getElementById('supply-tab')?.addEventListener('click', () => {
            this.switchMode('supply');
        });

        document.getElementById('borrow-tab')?.addEventListener('click', () => {
            this.switchMode('borrow');
        });

        // Supply modal
        document.getElementById('close-supply-modal')?.addEventListener('click', () => {
            document.getElementById('supply-modal').style.display = 'none';
        });

        // Withdraw modal
        document.getElementById('close-withdraw-modal')?.addEventListener('click', () => {
            document.getElementById('withdraw-modal').style.display = 'none';
        });

        // Borrow modal
        document.getElementById('close-borrow-modal')?.addEventListener('click', () => {
            document.getElementById('borrow-modal').style.display = 'none';
        });

        // Repay modal
        document.getElementById('close-repay-modal')?.addEventListener('click', () => {
            document.getElementById('repay-modal').style.display = 'none';
        });

        // Hide/Show sections
        document.getElementById('hide-supplies')?.addEventListener('click', () => {
            const table = document.getElementById('your-supplies-table');
            const isHidden = table.style.display === 'none';
            table.style.display = isHidden ? 'block' : 'none';
            document.getElementById('hide-supplies').textContent = isHidden ? 'Hide —' : 'Show +';
        });

        document.getElementById('hide-assets')?.addEventListener('click', () => {
            const table = document.getElementById('assets-to-supply-table');
            const isHidden = table.style.display === 'none';
            table.style.display = isHidden ? 'block' : 'none';
            document.getElementById('hide-assets').textContent = isHidden ? 'Hide —' : 'Show +';
        });

        // Percentage buttons for supply modal
        document.querySelectorAll('#supply-form .percentage-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const percentage = parseInt(btn.getAttribute('data-percentage'));
                this.setAmountByPercentage(percentage, 'supply');
            });
        });

        // Percentage buttons for withdraw modal
        document.querySelectorAll('#withdraw-form .percentage-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const percentage = parseInt(btn.getAttribute('data-percentage'));
                this.setAmountByPercentage(percentage, 'withdraw');
            });
        });

        // Supply button
        document.getElementById('supply-btn')?.addEventListener('click', () => {
            this.executeSupply();
        });

        // Withdraw button
        document.getElementById('withdraw-btn')?.addEventListener('click', () => {
            this.executeWithdraw();
        });

        // Collateral toggle
        document.getElementById('collateral-toggle')?.addEventListener('change', (e) => {
            this.collateralEnabled = e.target.checked;
        });

        // Show zero balance checkbox
        document.getElementById('show-zero-balance')?.addEventListener('change', () => {
            this.populateAssetsToSupply();
        });

        // Percentage buttons for borrow modal
        document.querySelectorAll('#borrow-form .percentage-btn-borrow').forEach(btn => {
            btn.addEventListener('click', () => {
                const percentage = parseInt(btn.getAttribute('data-percentage'));
                this.setAmountByPercentage(percentage, 'borrow');
                this.updateBorrowInput();
            });
        });

        // Percentage buttons for repay modal
        document.querySelectorAll('#repay-form .percentage-btn-repay').forEach(btn => {
            btn.addEventListener('click', () => {
                const percentage = parseInt(btn.getAttribute('data-percentage'));
                this.setAmountByPercentage(percentage, 'repay');
            });
        });

        // Borrow button
        document.getElementById('borrow-btn')?.addEventListener('click', () => {
            this.executeBorrow();
        });

        // Borrow amount input listener
        document.getElementById('borrow-amount')?.addEventListener('input', () => {
            this.updateBorrowInput();
        });

        // Unwrap WSTT toggle
        document.getElementById('unwrap-wstt-toggle')?.addEventListener('change', (e) => {
            this.unwrapWSTT = e.target.checked;
        });

        // Repay button
        document.getElementById('repay-btn')?.addEventListener('click', () => {
            this.executeRepay();
        });

        // Hide/Show borrow sections
        document.getElementById('hide-borrows')?.addEventListener('click', () => {
            const table = document.getElementById('your-borrows-table');
            const isHidden = table.style.display === 'none';
            table.style.display = isHidden ? 'block' : 'none';
            document.getElementById('hide-borrows').textContent = isHidden ? 'Hide —' : 'Show +';
        });

        document.getElementById('hide-borrow-assets')?.addEventListener('click', () => {
            const table = document.getElementById('assets-to-borrow-table');
            const isHidden = table.style.display === 'none';
            table.style.display = isHidden ? 'block' : 'none';
            document.getElementById('hide-borrow-assets').textContent = isHidden ? 'Hide —' : 'Show +';
        });

        // Load data and populate tables
        this.loadData();
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update tab styles
        const supplyTab = document.getElementById('supply-tab');
        const borrowTab = document.getElementById('borrow-tab');
        const supplyContent = document.getElementById('supply-content');
        const borrowContent = document.getElementById('borrow-content');
        
        if (mode === 'supply') {
            supplyTab.style.background = 'rgba(255, 0, 128, 0.2)';
            supplyTab.style.borderColor = 'rgba(255, 0, 128, 0.4)';
            supplyTab.style.color = '#FF0080';
            borrowTab.style.background = 'rgba(255, 255, 255, 0.05)';
            borrowTab.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            borrowTab.style.color = 'white';
            supplyContent.style.display = 'block';
            borrowContent.style.display = 'none';
        } else {
            borrowTab.style.background = 'rgba(255, 0, 128, 0.2)';
            borrowTab.style.borderColor = 'rgba(255, 0, 128, 0.4)';
            borrowTab.style.color = '#FF0080';
            supplyTab.style.background = 'rgba(255, 255, 255, 0.05)';
            supplyTab.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            supplyTab.style.color = 'white';
            supplyContent.style.display = 'none';
            borrowContent.style.display = 'block';
            
            // Populate borrow tables when switching to borrow mode
            setTimeout(() => {
                this.populateYourBorrows();
                this.populateAssetsToBorrow();
            }, 50);
        }
    }


    async loadData() {
        if (!walletManager.isConnected) {
            // Only populate tables if popup is open
            if (this.isPopupOpen()) {
                this.populateTables();
            }
            return;
        }

        try {
            // Load wallet balance
            const balance = await contractManager.getTokenBalance('STT');
            this.walletBalance = balance;
            
            // Load supplied balance (from lending pool)
            await this.loadSuppliedBalance();
            
            // Load borrow data (from lending pool)
            await this.loadBorrowData();
            
            // Only update UI if popup is open
            if (this.isPopupOpen()) {
                // Update net worth
                this.updateNetWorth();
                
                // Populate tables
                this.populateTables();
            }
        } catch (error) {
            // Only log error if popup is open (to avoid console spam)
            if (this.isPopupOpen()) {
                console.error('Error loading data:', error);
                this.populateTables();
            }
        }
    }

    // Check if popup is currently open and visible
    isPopupOpen() {
        const overlay = document.getElementById('popup-overlay');
        if (!overlay) return false;
        
        const netWorthEl = document.getElementById('net-worth');
        return overlay.style.display === 'flex' && netWorthEl !== null;
    }

    async loadBorrowData() {
        try {
            const userAddress = walletManager.getAddress();
            const lendingPoolAddress = contractManager.contracts.lendingPool;
            const provider = walletManager.getProvider();
            const wsttAddress = contractManager.tokens['WSTT'];
            
            const lendingPool = new ethers.Contract(
                lendingPoolAddress,
                contractManager.abis.lendingPool,
                provider
            );
            
            // Try getUserAccountData first
            let totalCollateralETH, totalDebtETH, availableBorrowsETH, ltv, healthFactor;
            let useFallback = false;
            
            try {
                // Get user account data
                // getUserAccountData returns: (totalCollateralETH, totalDebtETH, availableBorrowsETH, currentLiquidationThreshold, ltv, healthFactor)
                const accountData = await lendingPool.getUserAccountData(userAddress);
                
                // Parse tuple result
                if (Array.isArray(accountData)) {
                    totalCollateralETH = accountData[0];
                    totalDebtETH = accountData[1];
                    availableBorrowsETH = accountData[2];
                    ltv = accountData[4];
                    healthFactor = accountData[5];
                } else if (accountData.totalDebtETH) {
                    totalCollateralETH = accountData.totalCollateralETH;
                    totalDebtETH = accountData.totalDebtETH;
                    availableBorrowsETH = accountData.availableBorrowsETH;
                    ltv = accountData.ltv;
                    healthFactor = accountData.healthFactor;
                } else {
                    totalCollateralETH = accountData[0];
                    totalDebtETH = accountData[1];
                    availableBorrowsETH = accountData[2];
                    ltv = accountData[4];
                    healthFactor = accountData[5];
                }
            } catch (getUserAccountDataError) {
                // Silently fall back to alternative method - don't log errors to avoid console spam
                // getUserAccountData may fail with "Fallback not allowed" error
                useFallback = true;
            }
            
            // Fallback: Calculate from supplied balance and debt token
            if (useFallback) {
                try {
                    // Get borrowed balance from debt token directly
                    const debtTokenAddress = contractManager.debtTokens['WSTT'];
                    const debtToken = new ethers.Contract(
                        debtTokenAddress,
                        contractManager.abis.erc20,
                        provider
                    );
                    
                    // Get user's debt balance from debt token
                    const debtBalance = await debtToken.balanceOf(userAddress);
                    totalDebtETH = debtBalance || ethers.parseUnits('0', 18);
                    
                    console.log('Loaded debt balance from debt token:', ethers.formatUnits(totalDebtETH, 18));
                } catch (debtTokenError) {
                    // Silently use 0 if debt token balance cannot be fetched
                    totalDebtETH = ethers.parseUnits('0', 18);
                }
                
                try {
                    // Calculate from supplied balance
                    const suppliedBalanceWei = ethers.parseUnits(this.suppliedBalance || '0', 18);
                    totalCollateralETH = suppliedBalanceWei;
                    
                    // Estimate available borrow: Use LTV of 75% (0.75) as default
                    // availableBorrow = (collateral * LTV) - debt
                    const ltvRatio = 0.75; // 75% LTV (can be adjusted based on actual contract)
                    const maxBorrow = (totalCollateralETH * BigInt(Math.floor(ltvRatio * 10000))) / BigInt(10000);
                    availableBorrowsETH = maxBorrow > totalDebtETH ? maxBorrow - totalDebtETH : ethers.parseUnits('0', 18);
                    
                    ltv = ethers.parseUnits('7500', 0); // 75% in basis points
                    healthFactor = ethers.parseUnits('0', 18); // Cannot calculate without full account data
                    
                    console.log('Using fallback method - calculated available borrow from supplied balance and debt token');
                } catch (fallbackError) {
                    // Final fallback: Use supplied balance to estimate
                    // Silently handle errors to avoid console spam
                    const suppliedBalanceWei = ethers.parseUnits(this.suppliedBalance || '0', 18);
                    totalCollateralETH = suppliedBalanceWei;
                    // Estimate 75% of supplied as available borrow (assuming no debt)
                    const ltvRatio = 0.75;
                    availableBorrowsETH = (totalCollateralETH * BigInt(Math.floor(ltvRatio * 10000))) / BigInt(10000);
                    ltv = ethers.parseUnits('7500', 0);
                    healthFactor = ethers.parseUnits('0', 18);
                }
            }
            
            // Convert from Wei to STT (18 decimals)
            this.borrowedBalance = ethers.formatUnits(totalDebtETH, 18);
            this.availableBorrow = ethers.formatUnits(availableBorrowsETH, 18);
            this.healthFactor = healthFactor ? parseFloat(ethers.formatUnits(healthFactor, 18)) : 0;
            
            // Log detailed information for debugging
            const totalCollateral = ethers.formatUnits(totalCollateralETH, 18);
            const ltvPercent = ltv ? parseFloat(ethers.formatUnits(ltv, 2)) : 0; // LTV is usually in basis points (10000 = 100%)
            
            console.log('=== Borrow Data Debug ===');
            console.log('Method used:', useFallback ? 'Fallback' : 'getUserAccountData');
            console.log('totalCollateralETH (raw):', totalCollateralETH.toString());
            console.log('totalCollateral (STT):', totalCollateral);
            console.log('totalDebtETH (raw):', totalDebtETH.toString());
            console.log('borrowedBalance (STT):', this.borrowedBalance);
            console.log('availableBorrowsETH (raw):', availableBorrowsETH.toString());
            console.log('availableBorrow (STT):', this.availableBorrow);
            console.log('LTV:', ltvPercent + '%');
            console.log('Health Factor:', this.healthFactor);
            console.log('=== End Debug ===');
            
            // Calculate borrow power used
            const borrowedValue = parseFloat(this.borrowedBalance) * 0.405;
            const availableValue = parseFloat(this.availableBorrow) * 0.405;
            const totalBorrowPower = borrowedValue + availableValue;
            const borrowPowerUsed = totalBorrowPower > 0 ? ((borrowedValue / totalBorrowPower) * 100).toFixed(2) : '0';
            
            // Update UI
            const borrowedBalanceEl = document.getElementById('borrowed-balance');
            if (borrowedBalanceEl) {
                borrowedBalanceEl.textContent = `$${borrowedValue.toFixed(2)}`;
            }
            
            const borrowPowerUsedEl = document.getElementById('borrow-power-used');
            if (borrowPowerUsedEl) {
                borrowPowerUsedEl.textContent = `${borrowPowerUsed}%`;
            }
            
            // Update health factor in borrow modal if open
            const healthFactorEl = document.getElementById('borrow-health-factor');
            if (healthFactorEl) {
                if (this.healthFactor > 0) {
                    healthFactorEl.textContent = this.healthFactor.toFixed(2);
                    healthFactorEl.style.color = this.healthFactor >= 1.0 ? '#4ade80' : '#f87171';
                } else {
                    healthFactorEl.textContent = '-';
                }
            }
            
            console.log('Loaded borrow data - borrowed:', this.borrowedBalance, 'available:', this.availableBorrow, 'borrow power used:', borrowPowerUsed + '%', 'health factor:', this.healthFactor);
        } catch (error) {
            console.error('Error loading borrow data:', error);
            // Fallback: Calculate from supplied balance
            const suppliedAmount = parseFloat(this.suppliedBalance || '0');
            if (suppliedAmount > 0) {
                // Estimate available borrow as 75% of supplied balance (LTV = 75%)
                const estimatedAvailableBorrow = suppliedAmount * 0.75;
                this.availableBorrow = estimatedAvailableBorrow.toString();
                console.log('Using estimated available borrow from supplied balance:', this.availableBorrow);
            } else {
                this.borrowedBalance = '0';
                this.availableBorrow = '0';
            }
        }
    }

    async loadSuppliedBalance() {
        try {
            const userAddress = walletManager.getAddress();
            const provider = walletManager.getProvider();
            const lendingPoolAddress = contractManager.contracts.lendingPool;
            const wsttAddress = contractManager.tokens['WSTT'];
            
            const lendingPool = new ethers.Contract(
                lendingPoolAddress,
                contractManager.abis.lendingPool,
                provider
            );
            
            // Method 1: Directly use aToken address (fastest and most reliable)
            try {
                const aTokenAddress = contractManager.aTokens['WSTT'];
                
                if (aTokenAddress && aTokenAddress !== '0x0000000000000000000000000000000000000000') {
                    // Get aToken balance directly
                    const aToken = new ethers.Contract(
                        aTokenAddress,
                        contractManager.abis.erc20,
                        provider
                    );
                    
                    const aTokenBalance = await aToken.balanceOf(userAddress);
                    this.suppliedBalance = ethers.formatUnits(aTokenBalance, 18);
                    console.log('Loaded supplied balance from aToken:', this.suppliedBalance);
                    return;
                }
            } catch (aTokenError) {
                console.log('Error getting aToken balance directly, trying getReserveData...', aTokenError);
            }
            
            // Method 2: Try to get aToken address from getReserveData, then get balance
            try {
                const reserveData = await lendingPool.getReserveData(wsttAddress);
                // Parse tuple result - it returns an array or object depending on ABI
                let aTokenAddress;
                if (Array.isArray(reserveData)) {
                    aTokenAddress = reserveData[0]; // First element is aTokenAddress
                } else if (reserveData.aTokenAddress) {
                    aTokenAddress = reserveData.aTokenAddress;
                } else {
                    aTokenAddress = reserveData[0];
                }
                
                console.log('aTokenAddress from getReserveData:', aTokenAddress);
                
                if (aTokenAddress && aTokenAddress !== ethers.ZeroAddress && aTokenAddress !== '0x0000000000000000000000000000000000000000') {
                    // Get aToken balance directly
                    const aToken = new ethers.Contract(
                        aTokenAddress,
                        contractManager.abis.erc20,
                        provider
                    );
                    
                    const aTokenBalance = await aToken.balanceOf(userAddress);
                    this.suppliedBalance = ethers.formatUnits(aTokenBalance, 18);
                    console.log('Loaded supplied balance from aToken (via getReserveData):', this.suppliedBalance);
                    return;
                } else {
                    console.log('aTokenAddress is zero, trying getUserReserveData...');
                }
            } catch (aTokenError) {
                console.log('Error getting aToken balance, trying getUserReserveData...', aTokenError);
            }
            
            // Method 3: getUserReserveData is not available (Fallback not allowed error)
            // Skipping this method as it causes "Fallback not allowed" errors
            // We'll rely on aToken balanceOf and getUserAccountData instead
            
            // Method 4: Fallback to getUserAccountData
            try {
                const accountData = await lendingPool.getUserAccountData(userAddress);
                // Parse tuple result
                let totalCollateralETH;
                if (Array.isArray(accountData)) {
                    totalCollateralETH = accountData[0]; // First element is totalCollateralETH
                } else if (accountData.totalCollateralETH) {
                    totalCollateralETH = accountData.totalCollateralETH;
                } else {
                    totalCollateralETH = accountData[0];
                }
                
                console.log('totalCollateralETH:', totalCollateralETH);
                
                if (totalCollateralETH && totalCollateralETH > 0) {
                    this.suppliedBalance = ethers.formatUnits(totalCollateralETH, 18);
                    console.log('Loaded supplied balance from getUserAccountData:', this.suppliedBalance);
                } else {
                    this.suppliedBalance = '0';
                    console.log('No supplied balance found');
                }
            } catch (accountDataError) {
                console.error('Error getting account data:', accountDataError);
                this.suppliedBalance = '0';
            }
        } catch (error) {
            console.error('Error loading supplied balance:', error);
            this.suppliedBalance = '0';
        }
        
        // Log final supplied balance for debugging
        console.log('Final suppliedBalance:', this.suppliedBalance, 'type:', typeof this.suppliedBalance, 'parsed:', parseFloat(this.suppliedBalance));
    }

    updateNetWorth() {
        const walletValue = parseFloat(this.walletBalance) * 0.405; // STT price ~$0.405
        const suppliedValue = parseFloat(this.suppliedBalance) * 0.405;
        const netWorth = walletValue + suppliedValue;
        
        this.netWorth = netWorth.toFixed(2);
        
        // Only update DOM if elements exist (popup is open)
        const netWorthEl = document.getElementById('net-worth');
        if (netWorthEl) {
            netWorthEl.textContent = `$${this.netWorth}`;
        }
        
        // Update supplied balance display
        const suppliedBalanceEl = document.getElementById('supplied-balance');
        if (suppliedBalanceEl) {
            suppliedBalanceEl.textContent = `$${suppliedValue.toFixed(2)}`;
        }
        
        const collateralBalanceEl = document.getElementById('collateral-balance');
        if (collateralBalanceEl) {
            collateralBalanceEl.textContent = `$${suppliedValue.toFixed(2)}`;
        }
    }

    populateTables() {
        if (this.currentMode === 'supply') {
            this.populateYourSupplies();
            this.populateAssetsToSupply();
        } else {
            this.populateYourBorrows();
            this.populateAssetsToBorrow();
        }
        
        // Also populate assets to borrow if user has supplied balance, regardless of mode
        // This ensures the borrow section is always populated when user has supplies
        if (this.currentMode === 'borrow') {
            // Force repopulate to ensure it's shown
            setTimeout(() => {
                this.populateAssetsToBorrow();
            }, 100);
        }
    }

    populateYourBorrows() {
        const tbody = document.getElementById('your-borrows-body');
        if (!tbody) return;

        const borrowedAmount = parseFloat(this.borrowedBalance || '0');
        const usdValue = (borrowedAmount * 0.405).toFixed(2);

        if (borrowedAmount > 0) {
            tbody.innerHTML = `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <td style="padding: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #FF0080, #8B5CF6, #00D4FF);"></div>
                            <span style="color: white; font-weight: 600;">STT</span>
                        </div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <div style="color: white; font-weight: 600;">${borrowedAmount.toFixed(2)}</div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px;">$${usdValue}</div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <span style="color: white;">${this.borrowApy}%</span>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <button style="padding: 4px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600; cursor: default;">VARIABLE</button>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <button class="repay-btn" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600;">Repay</button>
                    </td>
                </tr>
            `;

            // Add event listeners
            tbody.querySelector('.repay-btn')?.addEventListener('click', () => {
                this.openRepayModal();
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="padding: 40px; text-align: center; color: rgba(255, 255, 255, 0.5);">
                        No borrows yet
                    </td>
                </tr>
            `;
        }
    }

    populateAssetsToBorrow() {
        const tbody = document.getElementById('assets-to-borrow-body');
        if (!tbody) {
            // Element not found - popup might not be open or in wrong mode
            return;
        }

        // Tokos.fi mantığı: "Assets to borrow" kısmı her zaman gösterilmeli
        // Eğer kullanıcının supplied balance'ı varsa, STT gösterilmeli
        // Available borrow, supplied balance'a göre hesaplanıyor (collateral'a göre)
        
        // Check suppliedBalance - convert to number for comparison
        const suppliedBalanceNum = parseFloat(this.suppliedBalance || '0');
        const availableAmount = parseFloat(this.availableBorrow || '0');
        const usdValue = (availableAmount * 0.405).toFixed(2);

        console.log('populateAssetsToBorrow - suppliedBalance:', this.suppliedBalance, 'suppliedBalanceNum:', suppliedBalanceNum, 'availableAmount:', availableAmount);

        // Tokos.fi mantığı: Eğer supplied balance > 0 ise, "Assets to borrow" kısmında STT göster
        // Available borrow 0 olsa bile göster (kullanıcı zaten borrow yapmış olabilir)
        if (suppliedBalanceNum > 0) {
            tbody.innerHTML = `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <td style="padding: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #FF0080, #8B5CF6, #00D4FF);"></div>
                            <span style="color: white; font-weight: 600;">STT</span>
                        </div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <div style="color: white; font-weight: 600;">${availableAmount.toFixed(2)}</div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px;">$${usdValue}</div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <span style="color: white;">${this.borrowApy}%</span>
                        <span style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-left: 4px;">variable</span>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <button class="borrow-btn" style="padding: 6px 12px; background: rgba(255, 200, 0, 0.2); border: 1px solid rgba(255, 200, 0, 0.4); border-radius: 6px; color: #FFC800; cursor: pointer; font-size: 12px; font-weight: 600;">Borrow</button>
                            <button style="padding: 6px 8px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px;">⋯</button>
                        </div>
                    </td>
                </tr>
            `;

            // Add event listener
            tbody.querySelector('.borrow-btn')?.addEventListener('click', () => {
                this.openBorrowModal();
            });
        } else {
            // Tokos.fi mantığı: Eğer supplied balance yoksa, "No available borrow limit" mesajı göster
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="padding: 40px; text-align: center; color: rgba(255, 255, 255, 0.5);">
                        No available borrow limit. Supply assets first.
                    </td>
                </tr>
            `;
        }
    }

    populateYourSupplies() {
        const tbody = document.getElementById('your-supplies-body');
        if (!tbody) return;

        const suppliedAmount = parseFloat(this.suppliedBalance || '0');
        const usdValue = (suppliedAmount * 0.405).toFixed(2);
        
        console.log('populateYourSupplies - suppliedBalance:', this.suppliedBalance, 'suppliedAmount:', suppliedAmount, 'type:', typeof this.suppliedBalance);

        if (suppliedAmount > 0 || (this.suppliedBalance && this.suppliedBalance !== '0' && this.suppliedBalance !== '' && parseFloat(this.suppliedBalance) > 0)) {
            tbody.innerHTML = `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <td style="padding: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #FF0080, #8B5CF6, #00D4FF);"></div>
                            <span style="color: white; font-weight: 600;">STT</span>
                        </div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <div style="color: white; font-weight: 600;">${suppliedAmount.toFixed(2)}</div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px;">$${usdValue}</div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <span style="color: white;">${this.supplyApy} %</span>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <label style="display: inline-flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" class="collateral-checkbox" checked style="width: 20px; height: 20px; cursor: pointer; accent-color: #4ade80;">
                        </label>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <button class="withdraw-btn" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px; font-weight: 600;">Withdraw</button>
                    </td>
                </tr>
            `;

            // Add event listeners
            tbody.querySelector('.withdraw-btn')?.addEventListener('click', () => {
                this.openWithdrawModal();
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="padding: 40px; text-align: center; color: rgba(255, 255, 255, 0.5);">
                        No supplies yet
                    </td>
                </tr>
            `;
        }
    }

    populateAssetsToSupply() {
        const tbody = document.getElementById('assets-to-supply-body');
        if (!tbody) return;

        const walletAmount = parseFloat(this.walletBalance);
        const showZero = document.getElementById('show-zero-balance')?.checked || false;

        if (walletAmount > 0 || showZero) {
            tbody.innerHTML = `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <td style="padding: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #FF0080, #8B5CF6, #00D4FF);"></div>
                            <span style="color: white; font-weight: 600;">STT</span>
                        </div>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <span style="color: white; font-weight: 600;">${walletAmount.toFixed(2)}</span>
                    </td>
                    <td style="padding: 15px; text-align: right;">
                        <span style="color: white;">${this.supplyApy} %</span>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <span style="color: #4ade80; font-size: 18px;">✓</span>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <button class="supply-btn" style="padding: 6px 12px; background: rgba(255, 200, 0, 0.2); border: 1px solid rgba(255, 200, 0, 0.4); border-radius: 6px; color: #FFC800; cursor: pointer; font-size: 12px; font-weight: 600;">Supply</button>
                            <button style="padding: 6px 8px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 12px;">⋯</button>
                        </div>
                    </td>
                </tr>
            `;

            // Add event listener
            tbody.querySelector('.supply-btn')?.addEventListener('click', () => {
                this.openSupplyModal();
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="padding: 40px; text-align: center; color: rgba(255, 255, 255, 0.5);">
                        No assets available
                    </td>
                </tr>
            `;
        }
    }

    openSupplyModal() {
        document.getElementById('supply-modal').style.display = 'flex';
        this.updateBalance();
    }

    openWithdrawModal() {
        document.getElementById('withdraw-modal').style.display = 'flex';
        document.getElementById('withdraw-supplied').textContent = `${parseFloat(this.suppliedBalance).toFixed(2)} STT`;
    }

    openBorrowModal() {
        document.getElementById('borrow-modal').style.display = 'flex';
        // Available borrow is based on supplied balance
        const availableAmount = parseFloat(this.availableBorrow || '0');
        document.getElementById('borrow-available').textContent = `${availableAmount.toFixed(2)} STT`;
        
        // Update health factor
        const healthFactorEl = document.getElementById('borrow-health-factor');
        if (healthFactorEl) {
            if (this.healthFactor > 0) {
                healthFactorEl.textContent = this.healthFactor.toFixed(2);
                healthFactorEl.style.color = this.healthFactor >= 1.0 ? '#4ade80' : '#f87171';
            } else {
                healthFactorEl.textContent = '-';
                healthFactorEl.style.color = '#4ade80';
            }
        }
        
        // Reset input
        const borrowAmountInput = document.getElementById('borrow-amount');
        if (borrowAmountInput) {
            borrowAmountInput.value = '';
            this.updateBorrowInput();
        }
    }

    updateBorrowInput() {
        const borrowAmountInput = document.getElementById('borrow-amount');
        const borrowBtn = document.getElementById('borrow-btn');
        const usdValueEl = document.getElementById('borrow-usd-value');
        
        if (!borrowAmountInput || !borrowBtn) return;
        
        const amount = parseFloat(borrowAmountInput.value || '0');
        const availableAmount = parseFloat(this.availableBorrow || '0');
        
        // Update USD value
        if (usdValueEl) {
            const usdValue = (amount * 0.405).toFixed(2);
            usdValueEl.textContent = `$${usdValue}`;
        }
        
        // Update button state
        if (amount > 0 && amount <= availableAmount) {
            borrowBtn.disabled = false;
            borrowBtn.style.background = 'linear-gradient(135deg, #FF0080, #00D4FF)';
            borrowBtn.style.border = 'none';
            borrowBtn.style.color = 'white';
            borrowBtn.style.cursor = 'pointer';
            borrowBtn.textContent = 'Borrow STT';
        } else {
            borrowBtn.disabled = true;
            borrowBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            borrowBtn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            borrowBtn.style.color = 'rgba(255, 255, 255, 0.5)';
            borrowBtn.style.cursor = 'not-allowed';
            borrowBtn.textContent = amount > 0 ? 'Insufficient available' : 'Enter an amount';
        }
    }

    openRepayModal() {
        document.getElementById('repay-modal').style.display = 'flex';
        document.getElementById('repay-borrowed').textContent = `${parseFloat(this.borrowedBalance).toFixed(2)} STT`;
    }

    async updateBalance() {
        if (!walletManager.isConnected) {
            const balanceEl = document.getElementById('supply-balance');
            if (balanceEl) balanceEl.textContent = 'Not connected';
            return;
        }

        try {
            const balance = await contractManager.getTokenBalance('STT');
            this.walletBalance = balance;
            const balanceEl = document.getElementById('supply-balance');
            if (balanceEl) balanceEl.textContent = `${parseFloat(balance).toFixed(2)} STT`;
        } catch (error) {
            console.error('Error fetching balance:', error);
            const balanceEl = document.getElementById('supply-balance');
            if (balanceEl) balanceEl.textContent = 'Error';
        }
    }

    setAmountByPercentage(percentage, mode = 'supply') {
        let availableBalance;
        
        if (mode === 'supply') {
            availableBalance = parseFloat(this.walletBalance);
        } else if (mode === 'withdraw') {
            availableBalance = parseFloat(this.suppliedBalance);
        } else if (mode === 'borrow') {
            availableBalance = parseFloat(this.availableBorrow);
        } else if (mode === 'repay') {
            availableBalance = parseFloat(this.borrowedBalance);
        } else {
            availableBalance = parseFloat(this.walletBalance);
        }

        if (!availableBalance || availableBalance <= 0) {
            toastManager.error('Bakiye yok');
            return;
        }

        const amount = (availableBalance * percentage) / 100;
        
        if (amount <= 0) {
            toastManager.error('Miktar çok düşük');
            return;
        }

        if (mode === 'supply') {
            const input = document.getElementById('supply-amount');
            if (input) input.value = amount.toFixed(6);
        } else if (mode === 'withdraw') {
            const input = document.getElementById('withdraw-amount');
            if (input) input.value = amount.toFixed(6);
        } else if (mode === 'borrow') {
            const input = document.getElementById('borrow-amount');
            if (input) input.value = amount.toFixed(6);
        } else if (mode === 'repay') {
            const input = document.getElementById('repay-amount');
            if (input) input.value = amount.toFixed(6);
        }
    }

    async executeSupply() {
        if (this.isSupplying) return;

        if (!walletManager.isConnected) {
            this.showMessage('Lütfen önce cüzdanınızı bağlayın', 'error');
            return;
        }

        const amount = document.getElementById('supply-amount').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            this.showMessage('Lütfen geçerli bir miktar girin', 'error');
            return;
        }

        if (parseFloat(amount) > parseFloat(this.walletBalance)) {
            this.showMessage('Yetersiz bakiye', 'error');
            return;
        }

        this.isSupplying = true;
        const btn = document.getElementById('supply-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Supplying STT...';
        btn.disabled = true;

        try {
            const result = await contractManager.supplySTT(amount, this.collateralEnabled);
            
            if (result.success) {
                const txHash = result.txHash;
                const explorerUrl = `https://shannon-explorer.somnia.network/tx/${txHash}`;
                
                toastManager.success(`Supplied ${amount} STT!`);
                
                // Close modal
                document.getElementById('supply-modal').style.display = 'none';
                
                // Wait a bit for blockchain to update
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Reload data multiple times to ensure it's updated
                // First reload
                await this.loadData();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Second reload - ensure borrow data is updated (availableBorrow depends on supplied balance)
                await this.loadBorrowData();
                await this.loadSuppliedBalance();
                this.updateNetWorth();
                this.populateTables();
                
                // Third reload after another delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                await this.loadData();
                
                // Show points earned
                setTimeout(() => {
                    const reward = pointsManager.getReward('lending');
                    toastManager.success(`+${reward} Points!`, 2000);
                }, 1500);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            toastManager.error(error.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
            this.isSupplying = false;
        }
    }

    async executeWithdraw() {
        if (this.isWithdrawing) return;

        if (!walletManager.isConnected) {
            this.showMessage('Lütfen önce cüzdanınızı bağlayın', 'error');
            return;
        }

        const amount = document.getElementById('withdraw-amount').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            this.showMessage('Lütfen geçerli bir miktar girin', 'error');
            return;
        }

        if (parseFloat(amount) > parseFloat(this.suppliedBalance)) {
            this.showMessage('Yetersiz supplied balance', 'error');
            return;
        }

        this.isWithdrawing = true;
        const btn = document.getElementById('withdraw-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Withdrawing STT...';
        btn.disabled = true;

        try {
            const result = await contractManager.withdrawSTT(amount);
            
            if (result.success) {
                const txHash = result.txHash;
                const explorerUrl = `https://shannon-explorer.somnia.network/tx/${txHash}`;
                
                toastManager.success(`Withdrew ${amount} STT!`);
                
                // Close modal
                document.getElementById('withdraw-modal').style.display = 'none';
                
                // Reload data
                await this.loadData();
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            toastManager.error(error.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
            this.isWithdrawing = false;
        }
    }

    async executeBorrow() {
        if (this.isBorrowing) return;

        if (!walletManager.isConnected) {
            this.showMessage('Lütfen önce cüzdanınızı bağlayın', 'error');
            return;
        }

        const amount = document.getElementById('borrow-amount').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            this.showMessage('Lütfen geçerli bir miktar girin', 'error');
            return;
        }

        if (parseFloat(amount) > parseFloat(this.availableBorrow)) {
            this.showMessage('Yetersiz borrow limiti', 'error');
            return;
        }

        this.isBorrowing = true;
        const btn = document.getElementById('borrow-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Borrowing STT...';
        btn.disabled = true;

        try {
            const result = await contractManager.borrowSTT(amount);
            
            if (result.success) {
                const txHash = result.txHash;
                const explorerUrl = `https://shannon-explorer.somnia.network/tx/${txHash}`;
                
                toastManager.success(`Borrowed ${amount} STT!`);
                
                // Close modal
                document.getElementById('borrow-modal').style.display = 'none';
                
                // Wait a bit for blockchain to update
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Reload data multiple times to ensure it's updated
                // First reload
                await this.loadData();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Second reload - ensure borrow data is updated (your borrows section)
                await this.loadBorrowData();
                await this.loadSuppliedBalance();
                
                // Only update UI if popup is still open
                if (this.isPopupOpen()) {
                    this.updateNetWorth();
                    this.populateTables();
                }
                
                // Third reload after another delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                await this.loadData();
                
                // Ensure we're on borrow mode to see the updated borrows (only if popup is open)
                if (this.isPopupOpen()) {
                    if (this.currentMode !== 'borrow') {
                        this.switchMode('borrow');
                    } else {
                        // Force repopulate borrow tables
                        this.populateYourBorrows();
                        this.populateAssetsToBorrow();
                    }
                }
                
                // Show points earned
                setTimeout(() => {
                    const reward = pointsManager.getReward('lending');
                    toastManager.success(`+${reward} Points!`, 2000);
                }, 1500);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            toastManager.error(error.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
            this.isBorrowing = false;
        }
    }

    async executeRepay() {
        if (this.isRepaying) return;

        if (!walletManager.isConnected) {
            this.showMessage('Lütfen önce cüzdanınızı bağlayın', 'error');
            return;
        }

        const amount = document.getElementById('repay-amount').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            this.showMessage('Lütfen geçerli bir miktar girin', 'error');
            return;
        }

        if (parseFloat(amount) > parseFloat(this.borrowedBalance)) {
            this.showMessage('Yetersiz borrowed balance', 'error');
            return;
        }

        this.isRepaying = true;
        const btn = document.getElementById('repay-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Repaying STT...';
        btn.disabled = true;

        try {
            // Note: We need to implement repaySTT in contracts.js
            // For now, this is a placeholder
            toastManager.error('Repay functionality not yet implemented');
        } catch (error) {
            this.showMessage(error.message, 'error');
            toastManager.error(error.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
            this.isRepaying = false;
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('result-message');
        if (!messageEl) return;

        messageEl.innerHTML = message;
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

