// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SomniaStaking
 * @dev Staking contract with rewards
 */
contract SomniaStaking is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public stakingToken;
    
    uint256 public constant REWARD_RATE = 25; // 25% APY
    uint256 public constant LOCK_PERIOD = 7 days;
    uint256 public constant RATE_DENOMINATOR = 100;
    uint256 public constant YEAR = 365 days;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }
    
    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // Claim pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimRewards();
        }
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");
        require(
            block.timestamp >= userStake.startTime + LOCK_PERIOD,
            "Lock period not elapsed"
        );
        
        // Claim rewards first
        _claimRewards();
        
        userStake.amount -= amount;
        totalStaked -= amount;
        
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Claim rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards();
    }
    
    /**
     * @dev Internal claim rewards
     */
    function _claimRewards() internal {
        uint256 rewards = calculateRewards(msg.sender);
        
        if (rewards > 0) {
            stakes[msg.sender].lastClaimTime = block.timestamp;
            stakingToken.safeTransfer(msg.sender, rewards);
            
            emit RewardsClaimed(msg.sender, rewards, block.timestamp);
        }
    }
    
    /**
     * @dev Calculate pending rewards
     */
    function calculateRewards(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - userStake.lastClaimTime;
        uint256 rewards = (userStake.amount * REWARD_RATE * stakingDuration) / (RATE_DENOMINATOR * YEAR);
        
        return rewards;
    }
    
    /**
     * @dev Get staking info for user
     */
    function getStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 startTime,
        uint256 timeUntilUnlock
    ) {
        Stake memory userStake = stakes[user];
        stakedAmount = userStake.amount;
        pendingRewards = calculateRewards(user);
        startTime = userStake.startTime;
        
        uint256 unlockTime = userStake.startTime + LOCK_PERIOD;
        if (block.timestamp >= unlockTime) {
            timeUntilUnlock = 0;
        } else {
            timeUntilUnlock = unlockTime - block.timestamp;
        }
        
        return (stakedAmount, pendingRewards, startTime, timeUntilUnlock);
    }
    
    /**
     * @dev Check if user can unstake
     */
    function canUnstake(address user) external view returns (bool) {
        return block.timestamp >= stakes[user].startTime + LOCK_PERIOD;
    }
}

