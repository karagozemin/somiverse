// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SomniaFaucet
 * @dev Simple faucet contract for distributing test tokens
 */
contract SomniaFaucet {
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18; // 100 tokens
    uint256 public constant COOLDOWN_TIME = 24 hours;
    
    mapping(address => uint256) public lastClaim;
    
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    
    /**
     * @dev Claim test tokens from faucet
     */
    function claimTokens() external {
        require(
            block.timestamp >= lastClaim[msg.sender] + COOLDOWN_TIME,
            "Cooldown period not elapsed"
        );
        
        require(
            address(this).balance >= FAUCET_AMOUNT,
            "Faucet is empty"
        );
        
        lastClaim[msg.sender] = block.timestamp;
        
        (bool success, ) = payable(msg.sender).call{value: FAUCET_AMOUNT}("");
        require(success, "Transfer failed");
        
        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }
    
    /**
     * @dev Get time until next claim is available
     */
    function getTimeUntilNextClaim(address user) external view returns (uint256) {
        uint256 nextClaimTime = lastClaim[user] + COOLDOWN_TIME;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }
    
    /**
     * @dev Check if user can claim
     */
    function canClaim(address user) external view returns (bool) {
        return block.timestamp >= lastClaim[user] + COOLDOWN_TIME;
    }
    
    /**
     * @dev Fund the faucet
     */
    receive() external payable {}
}

