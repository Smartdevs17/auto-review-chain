const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// Types
export interface UserProfile {
	userAddress: string
	name: string
	institution: string
	researchField: string
	reputationScore: string
	totalReviews: string
	tokensEarned: string
	isVerified: boolean
	expertise: string[]
}

// JWT token management
let authToken: string | null = null

export const authAPI = {
	// Get JWT token by connecting wallet
	async connectWallet(walletAddress: string) {
		const response = await fetch(`${BACKEND_URL}/auth/wallet-connect`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ walletAddress }),
		})
		
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.message || 'Failed to connect wallet')
		}
		
		const data = await response.json()
		authToken = data.access_token
		return data
	},

	// Get current auth token
	getToken() {
		return authToken
	},

	// Clear auth token
	clearToken() {
		authToken = null
	}
}

// Helper function to get headers with auth token
const getHeaders = (includeAuth = false) => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}
	
	if (includeAuth && authToken) {
		headers['Authorization'] = `Bearer ${authToken}`
	}
	
	return headers
}

// Backend API calls
export const backendAPI = {
	// Blockchain endpoints
	blockchain: {
		// Get contract info
		async getContractInfo() {
			const response = await fetch(`${BACKEND_URL}/blockchain/contract-info`)
			if (!response.ok) {
				throw new Error('Failed to get contract info')
			}
			return response.json()
		},

		// Get token balance
		async getTokenBalance(address: string) {
			const response = await fetch(`${BACKEND_URL}/blockchain/token-balance/${address}`)
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to get token balance')
			}
			return response.json()
		},

		// Get user profile from blockchain
		async getUserProfile(address: string): Promise<UserProfile> {
			const response = await fetch(`${BACKEND_URL}/blockchain/user/${address}/profile`)
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to get user profile')
			}
			return response.json()
		},


		// Record blockchain transaction
		async recordTransaction(data: {
			txHash: string
			type: string
			userWalletAddress: string
			manuscriptData?: any
			reviewData?: any
		}) {
			const response = await fetch(`${BACKEND_URL}/blockchain/record-blockchain-transaction`, {
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify(data),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to record transaction')
			}
			
			return response.json()
		}
	},

	// Users endpoints
	users: {
		// Create a new user
		async create(userData: {
			walletAddress: string
			name: string
			email?: string
			institution: string
			researchField: string
			expertise: string[]
		}) {
			const response = await fetch(`${BACKEND_URL}/users`, {
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify(userData),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to create user')
			}
			
			return response.json()
		},

		// Create or update a user
		async createOrUpdate(userData: {
			walletAddress: string
			name: string
			email?: string
			institution: string
			researchField: string
			expertise: string[]
		}) {
			const response = await fetch(`${BACKEND_URL}/users/create-or-update`, {
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify(userData),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to create or update user')
			}
			
			return response.json()
		},

		// Get user by wallet address
		async getByWalletAddress(address: string) {
			const response = await fetch(`${BACKEND_URL}/users/wallet/${address}`)
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('User not found')
				}
				const error = await response.json()
				throw new Error(error.message || 'Failed to get user')
			}
			return response.json()
		},

		// Get current user profile (requires authentication)
		async getProfile() {
			const response = await fetch(`${BACKEND_URL}/auth/profile`, {
				method: 'GET',
				headers: getHeaders(true),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to get profile')
			}
			
			return response.json()
		}
	},

	// Manuscript endpoints
	manuscripts: {
		// Submit manuscript to backend (requires authentication)
		async submit(data: {
			title: string
			abstract: string
			authors: string
			researchField: string
			fileHash: string
			keywords: string[]
		}) {
			const response = await fetch(`${BACKEND_URL}/manuscripts`, {
				method: 'POST',
				headers: getHeaders(true),
				body: JSON.stringify(data),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to submit manuscript')
			}
			
			return response.json()
		},

		// Get manuscript by ID
		async getById(id: string) {
			const response = await fetch(`${BACKEND_URL}/manuscripts/${id}`, {
				method: 'GET',
				headers: getHeaders(true),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to fetch manuscript')
			}
			
			return response.json()
		},

		// Get all manuscripts with pagination and search
		async findAll(page: number = 1, limit: number = 10, search?: string, field?: string) {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			})
			
			if (search) params.append('search', search)
			if (field) params.append('field', field)
			
			const response = await fetch(`${BACKEND_URL}/manuscripts?${params}`, {
				method: 'GET',
				headers: getHeaders(),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to fetch manuscripts')
			}
			
			return response.json()
		},

		// Update manuscript
		async update(id: string, data: any) {
			const response = await fetch(`${BACKEND_URL}/manuscripts/${id}`, {
				method: 'PATCH',
				headers: getHeaders(true),
				body: JSON.stringify(data),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to update manuscript')
			}
			
			return response.json()
		},

		// Delete manuscript
		async delete(id: string) {
			const response = await fetch(`${BACKEND_URL}/manuscripts/${id}`, {
				method: 'DELETE',
				headers: getHeaders(true),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to delete manuscript')
			}
			
			return response.json()
		}
	},

	// Review endpoints
	reviews: {
		// Get reviews by manuscript ID
		async getByManuscript(manuscriptId: string) {
			const response = await fetch(`${BACKEND_URL}/reviews/manuscript/${manuscriptId}`, {
				method: 'GET',
				headers: getHeaders(true),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to fetch reviews')
			}
			
			return response.json()
		},

		// Get all reviews with pagination
		async findAll(page: number = 1, limit: number = 10) {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			})
			
			const response = await fetch(`${BACKEND_URL}/reviews?${params}`, {
				method: 'GET',
				headers: getHeaders(true),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to fetch reviews')
			}
			
			return response.json()
		},

		// Create a new review
		async create(data: {
			manuscriptId: string
			rating: number
			summary: string
			detailedFeedback: string
		}) {
			const response = await fetch(`${BACKEND_URL}/reviews`, {
				method: 'POST',
				headers: getHeaders(true),
				body: JSON.stringify(data),
			})
			
			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to submit review')
			}
			
			return response.json()
		}
	}
}

// Utility functions
export const utils = {
	// Validate wallet address
	isValidAddress(address: string): boolean {
		return /^0x[a-fA-F0-9]{40}$/.test(address)
	},

	// Validate transaction hash
	isValidTxHash(hash: string): boolean {
		return /^0x[a-fA-F0-9]{64}$/.test(hash)
	},

	// Normalize wallet address to lowercase for consistent API calls
	normalizeAddress(address: string): string {
		return address.toLowerCase()
	}
}