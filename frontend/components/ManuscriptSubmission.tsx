import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { backendAPI } from '../lib/api'
import { blockchainService } from '../lib/blockchain'
import { useWalletSafe } from '../contexts/WalletContext'
import { toast } from 'sonner'

export function ManuscriptSubmission() {
  const walletContext = useWalletSafe()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  // Handle case where WalletContext is not available
  if (!walletContext) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manuscript Submission</CardTitle>
          <CardDescription>
            Please ensure you're on a page with wallet connection enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Wallet context is not available. Please navigate to the profile page first to connect your wallet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { isConnected, walletAddress, userProfile, isBlockchainRegistered } = walletContext
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    authors: '',
    researchField: '',
    keywords: '',
    file: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if wallet is connected and user is registered
    if (!isConnected || !walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!userProfile) {
      toast.error('Please register your profile first before submitting manuscripts')
      return
    }

    if (isBlockchainRegistered === false) {
      toast.error('You must be registered on the blockchain before submitting manuscripts. Please complete your profile registration first.')
      return
    }

    setIsLoading(true)
    try {
      // Convert keywords string to array
      const keywordsArray = formData.keywords
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)

      // For demo purposes, use a mock file hash
      const fileHash = `QmMockHash${Date.now()}`

      // Submit manuscript to blockchain first
      toast.info('Submitting manuscript to blockchain...')
      const txHash = await blockchainService.submitManuscript(
        walletAddress,
        formData.title,
        formData.abstract,
        formData.authors,
        formData.researchField,
        fileHash,
        keywordsArray
      )

      toast.success('Blockchain transaction confirmed! Recording in backend...')

      // Prepare manuscript data for backend
      const manuscriptData = {
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors,
        researchField: formData.researchField,
        keywords: keywordsArray,
        fileHash
        }

      // Submit to backend
      const backendResponse = await backendAPI.manuscripts.submit(manuscriptData)

      // Record blockchain transaction in backend
      await backendAPI.blockchain.recordTransaction({
        txHash: txHash,
        type: 'manuscript_submission',
        userWalletAddress: walletAddress,
        manuscriptData,
      })

      toast.success('Manuscript submitted successfully!')
      console.log('Blockchain transaction hash:', txHash)
      console.log('Backend response:', backendResponse)
      
      // Redirect to submission status page
      if (backendResponse?._id) {
        navigate(`/submission/${backendResponse._id}`)
      } else {
        toast.error('Failed to get manuscript ID for redirect')
      }
    } catch (error) {
      console.error('Submission failed:', error)
      if (error.message?.includes('Unauthorized')) {
        toast.error('Authentication failed. Please reconnect your wallet and try again.')
      } else if (error.message?.includes('User not registered')) {
        toast.error('You must be registered on the blockchain before submitting manuscripts.')
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction. Please add some Sepolia ETH to your wallet.')
      } else if (error.message?.includes('Wrong network')) {
        toast.error('Please switch to Sepolia testnet in MetaMask.')
      } else {
        toast.error(`Submission failed: ${error.message || 'Please try again.'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Submit Manuscript</CardTitle>
            <CardDescription>Submit your research manuscript to the blockchain</CardDescription>
          </div>
          {/* Blockchain Registration Status */}
          {isBlockchainRegistered === false && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              Not Registered
            </Badge>
          )}
          {isBlockchainRegistered === true && (
            <Badge variant="default" className="gap-1 bg-success/20 text-success border-success/30">
              <CheckCircle className="w-3 h-3" />
              Registered
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              rows={4}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="authors">Authors</Label>
            <Input
              id="authors"
              value={formData.authors}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="researchField">Research Field</Label>
            <Input
              id="researchField"
              value={formData.researchField}
              onChange={(e) => setFormData({ ...formData, researchField: e.target.value })}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="blockchain, peer review, decentralized, etc."
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="file">Manuscript File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Submitting...' : 'Submit Manuscript'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}