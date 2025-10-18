// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./PeerAIToken.sol";

/**
 * @title PeerAICore
 * @dev Main contract for PeerAI decentralized peer review platform
 * @notice Manages manuscripts, reviews, reputation scores, and token rewards
 */
contract PeerAICore is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Structs
    struct Manuscript {
        uint256 id;
        string title;
        string abstractText;
        string authors;
        string researchField;
        string fileHash; // IPFS hash
        address author;
        uint256 submissionTime;
        uint256 averageRating;
        uint256 reviewCount;
        bool isActive;
        string[] keywords;
    }
    
    struct Review {
        uint256 id;
        uint256 manuscriptId;
        address reviewer;
        string summary;
        string detailedFeedback;
        uint8 rating; // 1-5 scale
        string[] strengths;
        string[] weaknesses;
        string[] recommendations;
        bool isAiGenerated;
        uint256 submissionTime;
        bool isActive;
    }
    
    struct UserProfile {
        address userAddress;
        string name;
        string institution;
        string researchField;
        uint256 reputationScore;
        uint256 totalReviews;
        uint256 tokensEarned;
        bool isVerified;
        string[] expertise;
    }
    
    // State variables
    Counters.Counter private _manuscriptIds;
    Counters.Counter private _reviewIds;
    
    PeerAIToken public peerAIToken;
    
    mapping(uint256 => Manuscript) public manuscripts;
    mapping(uint256 => Review) public reviews;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => uint256[]) public userManuscripts;
    mapping(address => uint256[]) public userReviews;
    mapping(uint256 => uint256[]) public manuscriptReviews;
    
    // Events
    event ManuscriptSubmitted(
        uint256 indexed manuscriptId,
        address indexed author,
        string title,
        string fileHash
    );
    
    event ReviewSubmitted(
        uint256 indexed reviewId,
        uint256 indexed manuscriptId,
        address indexed reviewer,
        uint8 rating
    );
    
    event UserRegistered(
        address indexed user,
        string name,
        string institution
    );
    
    event ReputationUpdated(
        address indexed user,
        uint256 newReputationScore
    );
    
    event TokensRewarded(
        address indexed recipient,
        uint256 amount,
        string reason
    );
    
    event UserRemoved(
        address indexed user,
        string name,
        string reason
    );
    
    // Modifiers
    modifier onlyRegisteredUser() {
        require(userProfiles[msg.sender].userAddress != address(0), "User not registered");
        _;
    }
    
    modifier manuscriptExists(uint256 _manuscriptId) {
        require(manuscripts[_manuscriptId].id != 0, "Manuscript does not exist");
        _;
    }
    
    modifier reviewExists(uint256 _reviewId) {
        require(reviews[_reviewId].id != 0, "Review does not exist");
        _;
    }
    
    constructor(address _tokenAddress) {
        peerAIToken = PeerAIToken(_tokenAddress);
    }
    
    /**
     * @dev Register a new user
     * @param _name User's name
     * @param _institution User's institution
     * @param _researchField User's research field
     * @param _expertise Array of expertise areas
     */
    function registerUser(
        string memory _name,
        string memory _institution,
        string memory _researchField,
        string[] memory _expertise
    ) external {
        require(userProfiles[msg.sender].userAddress == address(0), "User already registered");
        
        userProfiles[msg.sender] = UserProfile({
            userAddress: msg.sender,
            name: _name,
            institution: _institution,
            researchField: _researchField,
            reputationScore: 0,
            totalReviews: 0,
            tokensEarned: 0,
            isVerified: false,
            expertise: _expertise
        });
        
        emit UserRegistered(msg.sender, _name, _institution);
    }
    
    /**
     * @dev Submit a new manuscript
     * @param _title Manuscript title
     * @param _abstractText Manuscript abstract
     * @param _authors List of authors
     * @param _researchField Research field
     * @param _fileHash IPFS hash of the manuscript file
     * @param _keywords Array of keywords
     */
    function submitManuscript(
        string memory _title,
        string memory _abstractText,
        string memory _authors,
        string memory _researchField,
        string memory _fileHash,
        string[] memory _keywords
    ) external onlyRegisteredUser returns (uint256) {
        _manuscriptIds.increment();
        uint256 manuscriptId = _manuscriptIds.current();
        
        manuscripts[manuscriptId] = Manuscript({
            id: manuscriptId,
            title: _title,
            abstractText: _abstractText,
            authors: _authors,
            researchField: _researchField,
            fileHash: _fileHash,
            author: msg.sender,
            submissionTime: block.timestamp,
            averageRating: 0,
            reviewCount: 0,
            isActive: true,
            keywords: _keywords
        });
        
        userManuscripts[msg.sender].push(manuscriptId);
        
        // Reward author with tokens
        peerAIToken.rewardAuthor(msg.sender, "manuscript_submitted");
        userProfiles[msg.sender].tokensEarned += 50 * 10**18;
        
        emit ManuscriptSubmitted(manuscriptId, msg.sender, _title, _fileHash);
        
        return manuscriptId;
    }
    
    /**
     * @dev Submit a review for a manuscript
     * @param _manuscriptId ID of the manuscript being reviewed
     * @param _summary Review summary
     * @param _detailedFeedback Detailed feedback
     * @param _rating Rating from 1-5
     * @param _strengths Array of strengths
     * @param _weaknesses Array of weaknesses
     * @param _recommendations Array of recommendations
     * @param _isAiGenerated Whether the review was AI-generated
     */
    function submitReview(
        uint256 _manuscriptId,
        string memory _summary,
        string memory _detailedFeedback,
        uint8 _rating,
        string[] memory _strengths,
        string[] memory _weaknesses,
        string[] memory _recommendations,
        bool _isAiGenerated
    ) external onlyRegisteredUser manuscriptExists(_manuscriptId) returns (uint256) {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(manuscripts[_manuscriptId].author != msg.sender, "Cannot review your own manuscript");
        require(manuscripts[_manuscriptId].isActive, "Manuscript is not active");
        
        _reviewIds.increment();
        uint256 reviewId = _reviewIds.current();
        
        reviews[reviewId] = Review({
            id: reviewId,
            manuscriptId: _manuscriptId,
            reviewer: msg.sender,
            summary: _summary,
            detailedFeedback: _detailedFeedback,
            rating: _rating,
            strengths: _strengths,
            weaknesses: _weaknesses,
            recommendations: _recommendations,
            isAiGenerated: _isAiGenerated,
            submissionTime: block.timestamp,
            isActive: true
        });
        
        // Update manuscript statistics
        Manuscript storage manuscript = manuscripts[_manuscriptId];
        manuscript.reviewCount++;
        manuscript.averageRating = ((manuscript.averageRating * (manuscript.reviewCount - 1)) + _rating) / manuscript.reviewCount;
        
        // Update user statistics
        UserProfile storage reviewer = userProfiles[msg.sender];
        reviewer.totalReviews++;
        reviewer.reputationScore = ((reviewer.reputationScore * (reviewer.totalReviews - 1)) + _rating) / reviewer.totalReviews;
        
        // Store review references
        userReviews[msg.sender].push(reviewId);
        manuscriptReviews[_manuscriptId].push(reviewId);
        
        // Reward reviewer with tokens
        peerAIToken.rewardReviewer(msg.sender, "review_completed");
        reviewer.tokensEarned += 100 * 10**18;
        
        emit ReviewSubmitted(reviewId, _manuscriptId, msg.sender, _rating);
        emit ReputationUpdated(msg.sender, reviewer.reputationScore);
        
        return reviewId;
    }
    
    /**
     * @dev Get manuscript details
     * @param _manuscriptId ID of the manuscript
     */
    function getManuscript(uint256 _manuscriptId) external view manuscriptExists(_manuscriptId) returns (Manuscript memory) {
        return manuscripts[_manuscriptId];
    }
    
    /**
     * @dev Get review details
     * @param _reviewId ID of the review
     */
    function getReview(uint256 _reviewId) external view reviewExists(_reviewId) returns (Review memory) {
        return reviews[_reviewId];
    }
    
    /**
     * @dev Get user profile
     * @param _userAddress Address of the user
     */
    function getUserProfile(address _userAddress) external view returns (UserProfile memory) {
        require(userProfiles[_userAddress].userAddress != address(0), "User not registered");
        return userProfiles[_userAddress];
    }
    
    /**
     * @dev Get reviews for a manuscript
     * @param _manuscriptId ID of the manuscript
     */
    function getManuscriptReviews(uint256 _manuscriptId) external view manuscriptExists(_manuscriptId) returns (uint256[] memory) {
        return manuscriptReviews[_manuscriptId];
    }
    
    /**
     * @dev Get manuscripts by user
     * @param _userAddress Address of the user
     */
    function getUserManuscripts(address _userAddress) external view returns (uint256[] memory) {
        return userManuscripts[_userAddress];
    }
    
    /**
     * @dev Get reviews by user
     * @param _userAddress Address of the user
     */
    function getUserReviews(address _userAddress) external view returns (uint256[] memory) {
        return userReviews[_userAddress];
    }
    
    /**
     * @dev Get total number of manuscripts
     */
    function getTotalManuscripts() external view returns (uint256) {
        return _manuscriptIds.current();
    }
    
    /**
     * @dev Get total number of reviews
     */
    function getTotalReviews() external view returns (uint256) {
        return _reviewIds.current();
    }
    
    /**
     * @dev Update user verification status (only owner)
     * @param _userAddress Address of the user
     * @param _isVerified Verification status
     */
    function updateUserVerification(address _userAddress, bool _isVerified) external onlyOwner {
        require(userProfiles[_userAddress].userAddress != address(0), "User not registered");
        userProfiles[_userAddress].isVerified = _isVerified;
    }
    
    /**
     * @dev Remove a registered user (only owner or user themselves)
     * @param _userAddress Address of the user to remove
     * @param _reason Reason for removal (for testing, admin actions, etc.)
     */
    function removeUser(address _userAddress, string memory _reason) external {
        require(userProfiles[_userAddress].userAddress != address(0), "User not registered");
        
        // Allow removal if:
        // 1. User is removing themselves, OR
        // 2. Owner is removing the user
        require(
            msg.sender == _userAddress || msg.sender == owner(),
            "Only user themselves or owner can remove user"
        );
        
        // Store user data for event emission
        string memory userName = userProfiles[_userAddress].name;
        
        // Clear user profile data
        delete userProfiles[_userAddress];
        
        // Clear user's manuscript and review arrays
        delete userManuscripts[_userAddress];
        delete userReviews[_userAddress];
        
        emit UserRemoved(_userAddress, userName, _reason);
    }
    
    /**
     * @dev Check if a user is registered
     * @param _userAddress Address of the user
     * @return bool True if user is registered
     */
    function isUserRegistered(address _userAddress) external view returns (bool) {
        return userProfiles[_userAddress].userAddress != address(0);
    }
    
    /**
     * @dev Emergency function to pause manuscript submissions (only owner)
     */
    function pauseManuscriptSubmissions() external onlyOwner {
        // Implementation for pausing functionality
    }
    
    /**
     * @dev Emergency function to pause review submissions (only owner)
     */
    function pauseReviewSubmissions() external onlyOwner {
        // Implementation for pausing functionality
    }
}
