import { expect } from "chai";
import { ethers } from "hardhat";

describe("PeerAI Contracts", function () {
  let peerAIToken: any;
  let peerAICore: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy PeerAIToken
    const PeerAIToken = await ethers.getContractFactory("PeerAIToken");
    peerAIToken = await PeerAIToken.deploy();
    await peerAIToken.deployed();

    // Deploy PeerAICore
    const PeerAICore = await ethers.getContractFactory("PeerAICore");
    peerAICore = await PeerAICore.deploy(peerAIToken.address);
    await peerAICore.deployed();

    // Transfer token ownership to PeerAICore
    await peerAIToken.transferOwnership(peerAICore.address);
  });

  describe("PeerAIToken", function () {
    it("Should have correct name and symbol", async function () {
      expect(await peerAIToken.name()).to.equal("PeerAI Token");
      expect(await peerAIToken.symbol()).to.equal("PAI");
    });

    it("Should have correct initial supply", async function () {
      const expectedSupply = ethers.utils.parseEther("1000000"); // 1 million tokens
      expect(await peerAIToken.totalSupply()).to.equal(expectedSupply);
    });

    it("Should allow owner to reward tokens", async function () {
      const rewardAmount = ethers.utils.parseEther("100");
      await peerAIToken.connect(owner).customReward(user1.address, rewardAmount, "test reward");
      
      expect(await peerAIToken.balanceOf(user1.address)).to.equal(rewardAmount);
    });
  });

  describe("PeerAICore", function () {
    beforeEach(async function () {
      // Register users
      await peerAICore.connect(user1).registerUser(
        "Alice Johnson",
        "Stanford University",
        "Computer Science",
        ["Machine Learning", "Blockchain"]
      );

      await peerAICore.connect(user2).registerUser(
        "Bob Smith",
        "MIT",
        "Computer Science",
        ["Cryptography", "AI"]
      );
    });

    it("Should allow user registration", async function () {
      const userProfile = await peerAICore.getUserProfile(user1.address);
      expect(userProfile.name).to.equal("Alice Johnson");
      expect(userProfile.institution).to.equal("Stanford University");
      expect(userProfile.researchField).to.equal("Computer Science");
    });

    it("Should allow manuscript submission", async function () {
      const keywords = ["blockchain", "peer review", "decentralized"];
      
      await expect(
        peerAICore.connect(user1).submitManuscript(
          "Decentralized Peer Review",
          "A novel approach to peer review using blockchain",
          "Alice Johnson",
          "Computer Science",
          "QmHash123...",
          keywords
        )
      ).to.emit(peerAICore, "ManuscriptSubmitted");
    });

    it("Should allow review submission", async function () {
      // First submit a manuscript
      const keywords = ["blockchain", "peer review"];
      await peerAICore.connect(user1).submitManuscript(
        "Test Paper",
        "Test abstract",
        "Alice Johnson",
        "Computer Science",
        "QmHash123...",
        keywords
      );

      // Then submit a review
      const strengths = ["Good methodology", "Clear presentation"];
      const weaknesses = ["Limited sample size"];
      const recommendations = ["Increase sample size"];

      await expect(
        peerAICore.connect(user2).submitReview(
          1, // manuscript ID
          "Good paper with room for improvement",
          "Detailed feedback here...",
          4, // rating
          strengths,
          weaknesses,
          recommendations,
          false // not AI generated
        )
      ).to.emit(peerAICore, "ReviewSubmitted");
    });

    it("Should update reputation scores correctly", async function () {
      // Submit manuscript and review
      const keywords = ["test"];
      await peerAICore.connect(user1).submitManuscript(
        "Test Paper",
        "Test abstract",
        "Alice Johnson",
        "Computer Science",
        "QmHash123...",
        keywords
      );

      const strengths = ["Good work"];
      const weaknesses = ["Minor issues"];
      const recommendations = ["Keep it up"];

      await peerAICore.connect(user2).submitReview(
        1,
        "Good paper",
        "Nice work",
        5,
        strengths,
        weaknesses,
        recommendations,
        false
      );

      const userProfile = await peerAICore.getUserProfile(user2.address);
      expect(userProfile.reputationScore).to.equal(5);
      expect(userProfile.totalReviews).to.equal(1);
    });

    it("Should prevent self-review", async function () {
      const keywords = ["test"];
      await peerAICore.connect(user1).submitManuscript(
        "Test Paper",
        "Test abstract",
        "Alice Johnson",
        "Computer Science",
        "QmHash123...",
        keywords
      );

      const strengths = ["Good work"];
      const weaknesses = ["Minor issues"];
      const recommendations = ["Keep it up"];

      await expect(
        peerAICore.connect(user1).submitReview(
          1,
          "Good paper",
          "Nice work",
          5,
          strengths,
          weaknesses,
          recommendations,
          false
        )
      ).to.be.revertedWith("Cannot review your own manuscript");
    });
  });
});
