# PeerAI Smart Contracts

Smart contracts for the PeerAI decentralized AI peer review platform on Ethereum.

## 🏗️ Contract Architecture

### Core Contracts

1. **PeerAIToken.sol** - ERC-20 token for platform rewards
2. **PeerAICore.sol** - Main platform contract managing manuscripts, reviews, and reputation

### Key Features

- **Token Rewards**: ERC-20 tokens for reviewers and authors
- **Reputation System**: On-chain reputation scoring
- **Manuscript Management**: Decentralized manuscript submission and tracking
- **Review System**: Peer review with AI integration support
- **User Profiles**: Academic profile management
- **IPFS Integration**: Decentralized file storage support

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Ethereum wallet with testnet ETH
- Alchemy API key
- Etherscan API key

### Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile
```

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your-private-key-here

# Alchemy API Key for testnet connections
ALCHEMY_API_KEY=your-alchemy-api-key-here

# Etherscan API Key for contract verification
ETHERSCAN_API_KEY=your-etherscan-api-key-here

# Network Configuration
NETWORK=sepolia
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run gas report
npm run gas-report
```

## 🚀 Deployment

### Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy to local network (in another terminal)
npm run deploy:local
```

### Testnet Deployment

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to Goerli testnet
npm run deploy:goerli

# Deploy to Mumbai testnet (Polygon)
npm run deploy:mumbai
```

### Contract Verification

```bash
# Verify on Etherscan
npm run verify:sepolia
npm run verify:goerli
npm run verify:mumbai
```

## 📋 Contract Details

### PeerAIToken (ERC-20)

**Features:**
- Initial supply: 1,000,000 PAI tokens
- Reward per review: 100 PAI tokens
- Reward per manuscript: 50 PAI tokens
- Pausable transfers
- Owner-controlled minting for rewards

**Key Functions:**
- `rewardReviewer(address, string)` - Reward tokens for completing reviews
- `rewardAuthor(address, string)` - Reward tokens for manuscript submission
- `customReward(address, uint256, string)` - Custom token rewards
- `burn(address, uint256)` - Burn tokens from an account

### PeerAICore

**Features:**
- User registration and profile management
- Manuscript submission with IPFS integration
- Review system with rating and feedback
- Reputation scoring algorithm
- Token reward automation
- Anti-gaming measures (no self-review)

**Key Functions:**
- `registerUser(string, string, string, string[])` - Register new user
- `submitManuscript(...)` - Submit research manuscript
- `submitReview(...)` - Submit peer review
- `getUserProfile(address)` - Get user profile and stats
- `getManuscript(uint256)` - Get manuscript details
- `getReview(uint256)` - Get review details

## 🔧 Integration

### Backend Integration

Update your backend `.env` with deployed contract addresses:

```env
PEERAI_TOKEN_ADDRESS=0x...
PEERAI_CORE_ADDRESS=0x...
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your-project-id
PRIVATE_KEY=your-private-key
```

### Frontend Integration

Use Web3 libraries to interact with contracts:

```javascript
// Example: Connect to contracts
const tokenContract = new ethers.Contract(
  PEERAI_TOKEN_ADDRESS,
  PeerAITokenABI,
  signer
);

const coreContract = new ethers.Contract(
  PEERAI_CORE_ADDRESS,
  PeerAICoreABI,
  signer
);
```

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:

- **PeerAIToken**: ~2.5M gas for deployment
- **PeerAICore**: ~4.2M gas for deployment
- **User Registration**: ~180K gas
- **Manuscript Submission**: ~250K gas
- **Review Submission**: ~320K gas

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for admin functions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive parameter validation
- **Anti-Gaming**: Prevents self-review and duplicate submissions

## 🌐 Supported Networks

- **Ethereum Mainnet** (Production)
- **Sepolia Testnet** (Recommended for testing)
- **Goerli Testnet** (Legacy)
- **Mumbai Testnet** (Polygon)
- **Local Hardhat Network** (Development)

## 📝 Contract Addresses

### Sepolia Testnet
```
PeerAIToken: TBD
PeerAICore: TBD
```

### Goerli Testnet
```
PeerAIToken: TBD
PeerAICore: TBD
```

### Mumbai Testnet
```
PeerAIToken: TBD
PeerAICore: TBD
```

## 🛠️ Development

### Adding New Features

1. Create new contract in `contracts/`
2. Add tests in `test/`
3. Update deployment script if needed
4. Run tests and verify gas usage
5. Deploy and verify on testnet

### Code Style

- Follow Solidity style guide
- Use NatSpec documentation
- Include comprehensive tests
- Optimize for gas efficiency

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethereum Development](https://ethereum.org/developers/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
