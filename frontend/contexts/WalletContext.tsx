import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { authAPI, backendAPI, utils } from '../lib/api'
import { blockchainService } from '../lib/blockchain'

interface WalletContextType {
  isConnected: boolean
  walletAddress: string
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  userProfile: any | null
  setUserProfile: (profile: any) => void
  isProfileLoading: boolean
  refreshProfile: () => Promise<void>
  authToken: string | null
  isBlockchainRegistered: boolean | null // Added blockchain registration status
  checkBlockchainRegistration: () => Promise<void> // Added function to check blockchain registration
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isBlockchainRegistered, setIsBlockchainRegistered] = useState<boolean | null>(null)

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Check if ethereum is available and has request method
        if (!window.ethereum.request) {
          throw new Error('Ethereum provider not properly initialized')
        }
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          const walletAddr = accounts[0]
          setWalletAddress(walletAddr)
          setIsConnected(true)
          
          // Authentize with backend and get token (normalize address for consistency)
          toast.info('Authenticating with backend...')
          const normalizedAddr = utils.normalizeAddress(walletAddr)
          const authResponse = await authAPI.connectWallet(normalizedAddr)
          setAuthToken(authResponse.access_token)
          
          toast.success('Wallet connected and authenticated!')
          
          // Check blockchain registration status
          await checkBlockchainRegistration()
          
          // Try to fetch user profile after authentication
          await fetchUserProfile(walletAddr)
        }
      } else {
        toast.error('Please install MetaMask or a compatible wallet!')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      if (error.message?.includes('User rejected')) {
        toast.error('Wallet connection was cancelled')
      } else if (error.message?.includes('provider not properly initialized')) {
        toast.error('Wallet provider conflict detected. Please refresh the page.')
      } else {
        toast.error('Failed to connect wallet: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress('')
    setUserProfile(null)
    setAuthToken(null)
    setIsBlockchainRegistered(null) // Clear blockchain registration status
    authAPI.clearToken()
    toast.success('Wallet disconnected')
  }

  const refreshProfile = async () => {
    if (walletAddress) {
      await fetchUserProfile(walletAddress)
    }
  }

  const checkBlockchainRegistration = async () => {
    if (!walletAddress) {
      setIsBlockchainRegistered(null)
      return
    }

    console.log('🔍 WalletContext: Checking blockchain registration for:', walletAddress)
    try {
      console.log('🔍 WalletContext: About to call blockchainService.isUserRegistered...')
      const isRegistered = await blockchainService.isUserRegistered(walletAddress)
      console.log('🔍 WalletContext: Got result from blockchainService:', isRegistered)
      setIsBlockchainRegistered(isRegistered)
      console.log('🔍 WalletContext: Blockchain registration status set to:', isRegistered)
      
      if (!isRegistered) {
        toast.warning('⚠️ Blockchain Registration Required', {
          description: 'You need to complete your profile registration on the blockchain to use all features.',
          duration: 8000,
        })
      } else {
        toast.success('✅ Blockchain Registration Verified', {
          description: 'You are registered on the blockchain and can use all features.',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error checking blockchain registration:', error)
      setIsBlockchainRegistered(null)
      toast.error('Failed to verify blockchain registration. Please try again.')
    }
  }

  const fetchUserProfile = async (address: string) => {
    setIsProfileLoading(true)
    try {
      // Normalize address to lowercase for consistent API calls
      const normalizedAddress = utils.normalizeAddress(address)
      console.log('Fetching profile for normalized address:', normalizedAddress)
      
      // First try to get from backend database
      const profile = await backendAPI.users.getByWalletAddress(normalizedAddress)
      setUserProfile(profile)
      console.log('User profile loaded from backend:', profile)
    } catch (error) {
      console.log('User profile fetch result:', error.message)
      // If user is not found in backend, that's expected - set to null to show registration form
      if (error.message?.includes('not found') || error.message?.includes('User not found')) {
        setUserProfile(null)
        console.log('User not found in backend - showing registration form')
      } else {
        // For other errors, still set to null but log the error
        console.error('Error fetching user profile:', error)
        setUserProfile(null)
      }
    } finally {
      setIsProfileLoading(false)
    }
  }

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.request) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
            setIsConnected(true)
            await checkBlockchainRegistration()
            await fetchUserProfile(accounts[0])
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error)
        }
      }
    }

    checkWalletConnection()
  }, [])

  return (
    <WalletContext.Provider value={{
      isConnected,
      walletAddress,
      connectWallet,
      disconnectWallet,
      userProfile,
      setUserProfile,
      isProfileLoading,
      refreshProfile,
      authToken,
      isBlockchainRegistered,
      checkBlockchainRegistration
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Safe version of useWallet that returns null instead of throwing
export function useWalletSafe() {
  const context = useContext(WalletContext)
  return context || null
}
