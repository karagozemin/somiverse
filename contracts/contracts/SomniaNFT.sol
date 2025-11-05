// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SomniaNFT
 * @dev NFT collection for Somnia Land
 */
contract SomniaNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;
    
    uint256 public tokenCounter;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.1 ether;
    
    string public baseURI;
    
    event NFTMinted(address indexed minter, uint256 indexed tokenId);
    
    constructor() ERC721("Somnia Genesis", "SOMGEN") Ownable(msg.sender) {
        tokenCounter = 0;
        baseURI = "ipfs://QmSomniaBaseURI/"; // Update with actual IPFS base URI
    }
    
    /**
     * @dev Mint a new NFT
     */
    function mint() external payable returns (uint256) {
        require(tokenCounter < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = tokenCounter;
        tokenCounter++;
        
        _safeMint(msg.sender, tokenId);
        
        emit NFTMinted(msg.sender, tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Mint multiple NFTs
     */
    function mintBatch(uint256 quantity) external payable returns (uint256[] memory) {
        require(tokenCounter + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = tokenCounter;
            tokenCounter++;
            
            _safeMint(msg.sender, tokenId);
            tokenIds[i] = tokenId;
            
            emit NFTMinted(msg.sender, tokenId);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Set mint price
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }
    
    /**
     * @dev Set base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }
    
    /**
     * @dev Withdraw funds
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Get tokens owned by address
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 0; i < tokenCounter; i++) {
            if (_ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
                if (index >= balance) break;
            }
        }
        
        return tokens;
    }
    
    // Override functions
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

