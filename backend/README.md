# PeerAI Backend API

A NestJS-based backend for the PeerAI decentralized AI peer review platform on Ethereum.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

4. **Run the application:**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

5. **Access the API:**
   - API: http://localhost:3001
   - Documentation: http://localhost:3001/api/docs

## 📋 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/peerai` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key` |
| `PORT` | Server port | `3001` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI reviews | `your-openai-api-key-here` |
| `ETHEREUM_RPC_URL` | Ethereum RPC endpoint | `https://mainnet.infura.io/v3/...` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |
| `TOKEN_REWARD_PER_REVIEW` | Tokens awarded per review | `100` |
| `TOKEN_REWARD_PER_MANUSCRIPT` | Tokens awarded per manuscript | `50` |

## 🔗 API Endpoints

### Authentication
- `POST /auth/wallet-connect` - Connect wallet and authenticate
- `GET /auth/profile` - Get current user profile
- `POST /auth/verify-token` - Verify JWT token

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `GET /users/wallet/:address` - Get user by wallet address
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user

### Manuscripts
- `POST /manuscripts` - Submit new manuscript
- `GET /manuscripts` - List manuscripts (with search/filter)
- `GET /manuscripts/:id` - Get manuscript details
- `GET /manuscripts/author/:authorId` - Get manuscripts by author
- `PATCH /manuscripts/:id` - Update manuscript
- `PATCH /manuscripts/:id/status` - Update manuscript status
- `DELETE /manuscripts/:id` - Delete manuscript

### Reviews
- `POST /reviews` - Submit new review
- `GET /reviews` - List reviews (with pagination)
- `GET /reviews/:id` - Get review details
- `GET /reviews/manuscript/:manuscriptId` - Get reviews for manuscript
- `GET /reviews/reviewer/:reviewerId` - Get reviews by reviewer
- `POST /reviews/ai/:manuscriptId` - Generate AI review
- `PATCH /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Blockchain
- `GET /blockchain/transactions` - Get blockchain transactions
- `GET /blockchain/transactions/:txHash` - Get transaction by hash
- `POST /blockchain/record-transaction` - Record blockchain transaction
- `POST /blockchain/submit-manuscript` - Submit manuscript to blockchain
- `POST /blockchain/reward-tokens` - Reward tokens to user
- `POST /blockchain/update-reputation` - Update reputation on blockchain

### AI
- `POST /ai/generate-review` - Generate AI review for manuscript
- `POST /ai/analyze-manuscript` - Analyze manuscript content

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── users/                # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── manuscripts/          # Manuscript management
│   ├── manuscripts.controller.ts
│   ├── manuscripts.service.ts
│   └── manuscripts.module.ts
├── reviews/              # Review system
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   └── reviews.module.ts
├── blockchain/           # Blockchain integration
│   ├── blockchain.controller.ts
│   ├── blockchain.service.ts
│   └── blockchain.module.ts
├── ai/                   # AI services
│   ├── ai.controller.ts
│   ├── ai.service.ts
│   └── ai.module.ts
├── schemas/              # MongoDB schemas
│   ├── user.schema.ts
│   ├── manuscript.schema.ts
│   ├── review.schema.ts
│   └── transaction.schema.ts
├── dto/                  # Data Transfer Objects
│   ├── create-user.dto.ts
│   ├── create-manuscript.dto.ts
│   └── create-review.dto.ts
├── app.module.ts         # Main application module
└── main.ts              # Application entry point
```

## 🔐 Authentication

The API uses JWT-based authentication with wallet addresses:

1. **Connect Wallet:** Send wallet address to `/auth/wallet-connect`
2. **Receive Token:** Get JWT token and user data
3. **Use Token:** Include `Authorization: Bearer <token>` header

## 🤖 AI Integration

### OpenAI Setup
1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `.env`: `OPENAI_API_KEY=your-key-here`
3. AI reviews will be generated automatically

### Mock Mode
If no OpenAI key is provided, the system uses mock AI reviews for development.

## ⛓️ Blockchain Integration

### Current Implementation
- Mock blockchain transactions for development
- Transaction recording and status tracking
- Token reward simulation

### Production Setup
1. Deploy smart contracts to Ethereum
2. Configure RPC endpoints in `.env`
3. Add private keys for transaction signing

## 📊 Database Schema

### User
- Wallet address, profile info, reputation score, tokens earned

### Manuscript
- Title, abstract, authors, research field, status, ratings

### Review
- Summary, rating, feedback, type (AI/Human), status

### Transaction
- Blockchain hash, type, status, amount, metadata

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t peerai-backend .

# Run container
docker run -p 3001:3001 --env-file .env peerai-backend
```

### Production Checklist
- [ ] Set strong JWT secret
- [ ] Configure production MongoDB
- [ ] Set up proper CORS origins
- [ ] Configure blockchain RPC endpoints
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS

## 📝 API Documentation

Interactive API documentation is available at `/api/docs` when the server is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.