import { ethers } from 'ethers'

/**
 * Normalize wallet address to lowercase for consistent storage and lookup
 * @param address - The wallet address to normalize
 * @returns Normalized lowercase wallet address
 */
export function normalizeWalletAddress(address: string): string {
	if (!address) {
		throw new Error('Address is required')
	}
	
	// Validate address format
	if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
		throw new Error('Invalid wallet address format')
	}
	
	// Return lowercase version for consistent storage
	return address.toLowerCase()
}

/**
 * Validate and checksum wallet address for blockchain operations
 * @param address - The wallet address to validate and checksum
 * @returns Checksummed wallet address
 */
export function validateAndChecksumAddress(address: string): string {
	if (!address) {
		throw new Error('Address is required')
	}
	
	// Validate address format
	if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
		throw new Error('Invalid wallet address format')
	}
	
	// Return checksummed address for blockchain operations
	return ethers.utils.getAddress(address)
}
