// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PeerAIToken
 * @dev ERC-20 token for PeerAI platform rewards
 * @notice This token is used to reward reviewers and authors on the PeerAI platform
 */
contract PeerAIToken is ERC20, Ownable, Pausable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant REWARD_PER_REVIEW = 100 * 10**18; // 100 tokens per review
    uint256 public constant REWARD_PER_MANUSCRIPT = 50 * 10**18; // 50 tokens per manuscript
    
    // Events
    event TokensRewarded(address indexed recipient, uint256 amount, string reason);
    event TokensBurned(address indexed account, uint256 amount);
    
    constructor() ERC20("PeerAI Token", "PAI") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Reward tokens to a user for completing a review
     * @param recipient Address to receive tokens
     * @param reason Reason for the reward (e.g., "review_completed")
     */
    function rewardReviewer(address recipient, string memory reason) external onlyOwner {
        _mint(recipient, REWARD_PER_REVIEW);
        emit TokensRewarded(recipient, REWARD_PER_REVIEW, reason);
    }
    
    /**
     * @dev Reward tokens to a user for submitting a manuscript
     * @param recipient Address to receive tokens
     * @param reason Reason for the reward (e.g., "manuscript_submitted")
     */
    function rewardAuthor(address recipient, string memory reason) external onlyOwner {
        _mint(recipient, REWARD_PER_MANUSCRIPT);
        emit TokensRewarded(recipient, REWARD_PER_MANUSCRIPT, reason);
    }
    
    /**
     * @dev Custom reward function for variable amounts
     * @param recipient Address to receive tokens
     * @param amount Amount of tokens to reward
     * @param reason Reason for the reward
     */
    function customReward(address recipient, uint256 amount, string memory reason) external onlyOwner {
        _mint(recipient, amount);
        emit TokensRewarded(recipient, amount, reason);
    }
    
    /**
     * @dev Burn tokens from an account
     * @param account Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer functions to include pausable functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfers are paused");
    }
}
