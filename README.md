# PeerAI: Decentralized AI Peer Review Platform

A comprehensive platform combining AI-powered peer review with blockchain transparency and token incentives for academic research.

## 🏗️ Project Structure

```
peerai/
├── frontend/          # React + TypeScript frontend
├── backend/           # NestJS + MongoDB API
├── contracts/         # Hardhat smart contracts
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Ethereum wallet with testnet ETH
- API keys: OpenAI, Alchemy, Etherscan

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Access:** http://localhost:5173

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run start:dev
```

**Access:** 
- API: http://localhost:3001
- Documentation: http://localhost:3001/api/docs

### 3. Smart Contracts Setup

```bash
cd contracts
npm install
cp .env.example .env
# Update .env with your keys
npm run compile
npm test
npm run deploy:sepolia
```

## 🔧 Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=0x...
VITE_NETWORK=sepolia
```

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/peerai
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
ALCHEMY_API_KEY=your-alchemy-key
ETHERSCAN_API_KEY=your-etherscan-key
PEERAI_TOKEN_ADDRESS=0x...
PEERAI_CORE_ADDRESS=0x...
```

### Contracts (.env)
```env
PRIVATE_KEY=your-private-key
ALCHEMY_API_KEY=your-alchemy-key
ETHERSCAN_API_KEY=your-etherscan-key
NETWORK=sepolia
```

## 🎯 Key Features

### Frontend
- **Modern UI**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Wallet Integration**: MetaMask and Web3 wallet support
- **Manuscript Submission**: File upload with IPFS integration
- **Review Dashboard**: Browse and manage peer reviews
- **User Profiles**: Academic profiles with reputation scores
- **Real-time Updates**: Live status tracking

### Backend
- **RESTful API**: NestJS with comprehensive endpoints
- **Authentication**: JWT-based wallet authentication
- **Database**: MongoDB with Mongoose schemas
- **AI Integration**: OpenAI for automated review generation
- **File Storage**: IPFS integration for decentralized storage
- **Documentation**: Swagger/OpenAPI documentation

### Smart Contracts
- **PeerAIToken**: ERC-20 token for platform rewards
- **PeerAICore**: Main platform contract
- **Reputation System**: On-chain reputation scoring
- **Token Rewards**: Automated token distribution
- **Anti-Gaming**: Prevents self-review and manipulation

## 📊 API Endpoints

### Authentication
- `POST /auth/wallet-connect` - Connect wallet
- `GET /auth/profile` - Get user profile

### Manuscripts
- `POST /manuscripts` - Submit manuscript
- `GET /manuscripts` - List manuscripts
- `GET /manuscripts/:id` - Get manuscript details

### Reviews
- `POST /reviews` - Submit review
- `GET /reviews` - List reviews
- `POST /reviews/ai/:id` - Generate AI review

### Blockchain
- `POST /blockchain/submit-manuscript` - Record on-chain
- `POST /blockchain/reward-tokens` - Issue rewards

## 🔗 Smart Contract Functions

### PeerAIToken
- `rewardReviewer(address, string)` - Reward reviewer
- `rewardAuthor(address, string)` - Reward author
- `customReward(address, uint256, string)` - Custom rewards

### PeerAICore
- `registerUser(...)` - Register user
- `submitManuscript(...)` - Submit manuscript
- `submitReview(...)` - Submit review
- `getUserProfile(address)` - Get user stats

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
npm test
npm run test:e2e
```

### Contracts
```bash
cd contracts
npm test
npm run test:coverage
```

## 🚀 Deployment

### Development
```bash
# Start all services
npm run dev:all
```

### Production
```bash
# Deploy contracts
cd contracts && npm run deploy:sepolia

# Deploy backend
cd backend && npm run build && npm run start:prod

# Deploy frontend
cd frontend && npm run build
```

## 🌐 Supported Networks

- **Sepolia Testnet** (Recommended)
- **Goerli Testnet** (Legacy)
- **Mumbai Testnet** (Polygon)
- **Local Hardhat** (Development)

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend API Documentation](./backend/README.md)
- [Smart Contracts Documentation](./contracts/README.md)
- [API Documentation](http://localhost:3001/api/docs) (when running)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

---

**Built with ❤️ for the decentralized science community**
