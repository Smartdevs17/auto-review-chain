import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { backendAPI } from '../lib/api'
import { blockchainService } from '../lib/blockchain'
import { useWallet } from '../contexts/WalletContext'
import { toast } from 'sonner'

export function UserRegistration() {
  const [isLoading, setIsLoading] = useState(false)
  const { isConnected, walletAddress, userProfile, setUserProfile, checkBlockchainRegistration, isBlockchainRegistered } = useWallet()
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    researchField: '',
    expertise: '',
  })

  // Pre-populate form with existing user data if available
  useEffect(() => {
    if (userProfile && isBlockchainRegistered === false) {
      console.log('🔍 Pre-populating form with existing user data:', userProfile)
      setFormData({
        name: userProfile.name || '',
        institution: userProfile.institution || '',
        researchField: userProfile.researchField || '',
        expertise: userProfile.expertise ? userProfile.expertise.join(', ') : '',
      })
    }
  }, [userProfile, isBlockchainRegistered])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      // Convert expertise string to array
      const expertiseArray = formData.expertise
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)

      // Register user on blockchain (user pays for transaction)
      toast.info('Please confirm the transaction in your wallet...')
      const txHash = await blockchainService.registerUser(
        walletAddress,
        formData.name,
        formData.institution,
        formData.researchField,
        expertiseArray
      )

      toast.success('Transaction submitted! Recording in backend...')

      // Record the transaction in backend database
      await backendAPI.blockchain.recordTransaction({
        txHash,
        type: 'user_registration',
        userWalletAddress: walletAddress,
      })

      // Create user in backend database
      toast.info('Creating user profile in backend...')
      const createdUser = await backendAPI.users.createOrUpdate({
        walletAddress: walletAddress,
        name: formData.name,
        institution: formData.institution,
        researchField: formData.researchField,
        expertise: expertiseArray,
      })

      // Update frontend state with the created user
      setUserProfile(createdUser)
      
      // Refresh blockchain registration status
      await checkBlockchainRegistration()
      
      toast.success('User registered successfully on blockchain and backend!')
      console.log('Registration transaction hash:', txHash)
      console.log('Created user:', createdUser)
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // If user is already registered on blockchain, show success message
  if (isBlockchainRegistered === true) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">✅ User Registered</CardTitle>
          <CardDescription>Your profile is registered on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> {userProfile?.name || formData.name}</p>
            <p><strong>Institution:</strong> {userProfile?.institution || formData.institution}</p>
            <p><strong>Research Field:</strong> {userProfile?.researchField || formData.researchField}</p>
            <p><strong>Expertise:</strong> {(userProfile?.expertise || formData.expertise.split(',')).join(', ')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Blockchain Registration</CardTitle>
        <CardDescription>
          {userProfile 
            ? "Your profile exists in our database. Complete the registration on the blockchain to use all features."
            : "Register your profile on the blockchain"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userProfile && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>📝 Form Pre-filled:</strong> Your existing profile data has been loaded. You can modify the details below if needed, then click "Register on Blockchain" to complete your registration.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="e.g., Stanford University, MIT, etc."
              className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="researchField">Research Field</Label>
            <Input
              id="researchField"
              type="text"
              value={formData.researchField}
              onChange={(e) => setFormData({ ...formData, researchField: e.target.value })}
              placeholder="e.g., Computer Science, Biology, etc."
              className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="expertise">Expertise (comma-separated)</Label>
            <Textarea
              id="expertise"
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              placeholder="Machine Learning, Blockchain, AI, etc."
              className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Registering on Blockchain...' : 'Register on Blockchain'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}