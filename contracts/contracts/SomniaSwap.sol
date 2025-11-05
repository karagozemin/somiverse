// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SomniaSwap
 * @dev Simple AMM-style DEX for token swaps
 */
contract SomniaSwap is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    uint256 public constant FEE_PERCENTAGE = 3; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    // Token reserves
    mapping(address => uint256) public reserves;
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;
    
    address public owner;
    
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    
    event LiquidityAdded(address indexed token, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add a new supported token
     */
    function addToken(address token) external onlyOwner {
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;
        tokenList.push(token);
    }
    
    /**
     * @dev Add liquidity to the pool
     */
    function addLiquidity(address token, uint256 amount) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        reserves[token] += amount;
        
        emit LiquidityAdded(token, amount);
    }
    
    /**
     * @dev Swap tokens
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        require(supportedTokens[tokenIn], "TokenIn not supported");
        require(supportedTokens[tokenOut], "TokenOut not supported");
        require(tokenIn != tokenOut, "Cannot swap same token");
        require(amountIn > 0, "Amount must be > 0");
        
        // Simple swap formula with fee
        uint256 fee = (amountIn * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - fee;
        
        // Simple 1:1 ratio for demo (in production, use AMM formula)
        amountOut = amountInAfterFee;
        
        require(amountOut >= minAmountOut, "Slippage too high");
        require(reserves[tokenOut] >= amountOut, "Insufficient liquidity");
        
        // Transfer tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        reserves[tokenIn] += amountIn;
        
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        reserves[tokenOut] -= amountOut;
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut, fee);
        
        return amountOut;
    }
    
    /**
     * @dev Get swap quote
     */
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external pure returns (uint256 amountOut, uint256 fee) {
        fee = (amountIn * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        amountOut = amountIn - fee;
        return (amountOut, fee);
    }
    
    /**
     * @dev Get reserve balance
     */
    function getReserve(address token) external view returns (uint256) {
        return reserves[token];
    }
}

