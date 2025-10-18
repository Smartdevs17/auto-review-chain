import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { FileText, Clock, CheckCircle, Users, Star, ArrowLeft } from 'lucide-react'
import { backendAPI } from '../lib/api'
import { useWallet } from '../contexts/WalletContext'
import { toast } from 'sonner'

const SubmissionStatus = () => {
  const { manuscriptId } = useParams<{ manuscriptId: string }>()
  const navigate = useNavigate()
  const { walletAddress } = useWallet()
  const [manuscript, setManuscript] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    if (manuscriptId) {
      fetchManuscriptDetails()
    }
  }, [manuscriptId])

  const fetchManuscriptDetails = async () => {
    try {
      setIsLoading(true)
      const manuscriptData = await backendAPI.manuscripts.getById(manuscriptId!)
      setManuscript(manuscriptData)
      
      // Fetch reviews for this manuscript
      try {
        const reviewsData = await backendAPI.reviews.getByManuscript(manuscriptId!)
        setReviews(reviewsData)
      } catch (error) {
        console.log('No reviews found yet')
        setReviews([])
      }
    } catch (error) {
      console.error('Failed to fetch manuscript:', error)
      toast.error('Failed to load manuscript details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Under Review</Badge>
      case 'under_review':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Under Review</Badge>
      case 'accepted':
        return <Badge variant="default" className="gap-1 bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3" />Accepted</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><FileText className="w-3 h-3" />Rejected</Badge>
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Under Review</Badge>
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
    return (totalRating / reviews.length).toFixed(1)
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="glass p-8">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading submission details...</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!manuscript) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="glass p-8">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Manuscript Not Found</h1>
                  <p className="text-muted-foreground mb-6">The manuscript you're looking for doesn't exist or you don't have access to it.</p>
                  <Button onClick={() => navigate('/submit')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Submit
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/submit')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Submit
              </Button>
              {getStatusBadge(manuscript.status)}
            </div>

            {/* Main Manuscript Card */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{manuscript.title}</CardTitle>
                    <CardDescription className="text-lg">
                      by {manuscript.authors}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Submitted: {new Date(manuscript.createdAt).toLocaleDateString()}</p>
                    <p>ID: #{manuscript._id?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Abstract */}
                <div>
                  <h3 className="font-semibold mb-2">Abstract</h3>
                  <p className="text-muted-foreground leading-relaxed">{manuscript.abstract}</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Research Field</h4>
                    <Badge variant="outline">{manuscript.researchField}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {manuscript.keywords?.map((keyword: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* File Hash */}
                <div>
                  <h4 className="font-semibold mb-2">File Hash</h4>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{manuscript.fileHash}</code>
                </div>
              </CardContent>
            </Card>

            {/* Review Status */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Review Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{reviews.length}</div>
                    <div className="text-sm text-muted-foreground">Reviews Received</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                      <Star className="w-5 h-5" />
                      {getAverageRating()}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {manuscript.status === 'accepted' ? '✅' : manuscript.status === 'rejected' ? '❌' : '⏳'}
                    </div>
                    <div className="text-sm text-muted-foreground">Current Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>Feedback from peer reviewers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={review._id || index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.summary}</p>
                      {review.detailedFeedback && (
                        <p className="text-sm">{review.detailedFeedback}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/submit')} variant="outline">
                Submit Another Manuscript
              </Button>
              <Button onClick={() => navigate('/reviews')}>
                View All Reviews
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SubmissionStatus
