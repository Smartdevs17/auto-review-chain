import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Clock, CheckCircle, AlertCircle, Search, Star, Loader2, MessageSquare } from "lucide-react";
import { backendAPI } from "../lib/api";
import { useWallet } from "../contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import sampleManuscripts from "../data/sample-manuscripts.json";

const mockReviews = [
  {
    id: 1,
    title: "Quantum Computing Applications in Cryptography",
    authors: "Alice Johnson, Bob Smith",
    status: "completed",
    rating: 4.5,
    reviewCount: 3,
    timestamp: "2 days ago",
    field: "Computer Science",
  },
  {
    id: 2,
    title: "Neural Networks for Climate Prediction Models",
    authors: "Carol White, David Brown",
    status: "in-progress",
    rating: 0,
    reviewCount: 1,
    timestamp: "5 hours ago",
    field: "Environmental Science",
  },
  {
    id: 3,
    title: "Blockchain Applications in Healthcare Data Management",
    authors: "Eve Davis, Frank Miller",
    status: "completed",
    rating: 4.8,
    reviewCount: 5,
    timestamp: "1 week ago",
    field: "Healthcare",
  },
  {
    id: 4,
    title: "Machine Learning in Drug Discovery",
    authors: "Grace Lee, Henry Wilson",
    status: "pending",
    rating: 0,
    reviewCount: 0,
    timestamp: "30 minutes ago",
    field: "Biotechnology",
  },
];

interface Manuscript {
  _id: string;
  title: string;
  authors: string;
  abstract: string;
  researchField: string;
  keywords: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  authorId: {
    _id: string;
    name: string;
    walletAddress: string;
    institution: string;
    researchField: string;
  };
  reviews?: any[];
}

const Reviews = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, userProfile } = useWallet();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredManuscripts, setFilteredManuscripts] = useState<Manuscript[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    summary: '',
    detailedFeedback: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedManuscriptForDetails, setSelectedManuscriptForDetails] = useState<Manuscript | null>(null);

  useEffect(() => {
    fetchManuscripts();
  }, []);

  useEffect(() => {
    // Filter manuscripts based on search term
    if (!searchTerm.trim()) {
      setFilteredManuscripts(manuscripts);
    } else {
      const filtered = manuscripts.filter(manuscript =>
        manuscript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manuscript.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manuscript.researchField.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manuscript.abstract.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredManuscripts(filtered);
    }
  }, [searchTerm, manuscripts]);

  const fetchManuscripts = async () => {
    try {
      setIsLoading(true);
      const response = await backendAPI.manuscripts.findAll(1, 50); // Get first 50 manuscripts
      const backendManuscripts = response.manuscripts || [];
      
      // Combine backend manuscripts with sample manuscripts
      const allManuscripts = [...backendManuscripts, ...sampleManuscripts.manuscripts];
      setManuscripts(allManuscripts);
      setFilteredManuscripts(allManuscripts);
    } catch (error: any) {
      console.error('Failed to fetch manuscripts:', error);
      // If backend fails, use only sample manuscripts
      setManuscripts(sampleManuscripts.manuscripts);
      setFilteredManuscripts(sampleManuscripts.manuscripts);
    } finally {
      setIsLoading(false);
    }
  };

  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const getReviewCount = (reviews: any[]) => {
    return reviews ? reviews.length : 0;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleViewDetails = (manuscript: Manuscript) => {
    // Check if it's a sample manuscript (starts with "sample_")
    const isSampleManuscript = manuscript._id.startsWith('sample_');
    
    if (isSampleManuscript) {
      // For sample manuscripts, show details in a modal
      setSelectedManuscriptForDetails(manuscript);
      setDetailsModalOpen(true);
    } else {
      // For real manuscripts, navigate to submission status page
      navigate(`/submission/${manuscript._id}`);
    }
  };

  const handleOpenReviewModal = (manuscript: Manuscript) => {
    if (!isConnected || !userProfile) {
      toast.error('Please connect your wallet and register to submit reviews');
      return;
    }

    // Check if user is trying to review their own manuscript
    if (manuscript.authorId._id === userProfile._id) {
      toast.error('You cannot review your own manuscript');
      return;
    }

    setSelectedManuscript(manuscript);
    setReviewFormData({
      rating: 5,
      summary: '',
      detailedFeedback: '',
    });
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedManuscript || !userProfile) return;

    setIsSubmittingReview(true);
    try {
      // Check if it's a sample manuscript (starts with "sample_")
      const isSampleManuscript = selectedManuscript._id.startsWith('sample_');
      
      if (isSampleManuscript) {
        // Simulate review submission for sample manuscripts
        const newReview = {
          _id: `review_${Date.now()}`,
          rating: reviewFormData.rating,
          summary: reviewFormData.summary,
          detailedFeedback: reviewFormData.detailedFeedback,
          reviewerId: {
            _id: userProfile._id,
            name: userProfile.name
          },
          createdAt: new Date().toISOString()
        };

        // Update the manuscript in local state
        setManuscripts(prev => prev.map(manuscript => {
          if (manuscript._id === selectedManuscript._id) {
            const updatedReviews = [...(manuscript.reviews || []), newReview];
            const newReviewCount = updatedReviews.length;
            const newAverageRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0) / newReviewCount;
            
            // Change status to "under_review" after first review
            const newStatus = newReviewCount === 1 ? 'under_review' : manuscript.status;
            
            return {
              ...manuscript,
              reviews: updatedReviews,
              reviewCount: newReviewCount,
              averageRating: newAverageRating,
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
          }
          return manuscript;
        }));

        setFilteredManuscripts(prev => prev.map(manuscript => {
          if (manuscript._id === selectedManuscript._id) {
            const updatedReviews = [...(manuscript.reviews || []), newReview];
            const newReviewCount = updatedReviews.length;
            const newAverageRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0) / newReviewCount;
            
            // Change status to "under_review" after first review
            const newStatus = newReviewCount === 1 ? 'under_review' : manuscript.status;
            
            return {
              ...manuscript,
              reviews: updatedReviews,
              reviewCount: newReviewCount,
              averageRating: newAverageRating,
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
          }
          return manuscript;
        }));

        toast.success('Review submitted successfully!');
      } else {
        // Real backend submission for actual manuscripts
        await backendAPI.reviews.create({
          manuscriptId: selectedManuscript._id,
          rating: reviewFormData.rating,
          summary: reviewFormData.summary,
          detailedFeedback: reviewFormData.detailedFeedback,
        });

        toast.success('Review submitted successfully!');
        
        // Refresh manuscripts to show updated review count
        await fetchManuscripts();
      }

      setReviewModalOpen(false);
      setSelectedManuscript(null);
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      // Backend status values
      case "submitted":
        return {
          icon: FileText,
          label: "Submitted",
          variant: "outline" as const,
          className: "bg-blue-500/20 text-blue-600 border-blue-500/30",
        };
      case "under_review":
        return {
          icon: Clock,
          label: "Under Review",
          variant: "secondary" as const,
          className: "bg-warning/20 text-warning border-warning/30",
        };
      case "reviewed":
        return {
          icon: CheckCircle,
          label: "Reviewed",
          variant: "default" as const,
          className: "bg-success/20 text-success border-success/30",
        };
      case "published":
        return {
          icon: CheckCircle,
          label: "Published",
          variant: "default" as const,
          className: "bg-green-500/20 text-green-600 border-green-500/30",
        };
      case "rejected":
        return {
          icon: AlertCircle,
          label: "Rejected",
          variant: "destructive" as const,
          className: "bg-red-500/20 text-red-600 border-red-500/30",
        };
      // Legacy hardcoded status values (for featured manuscripts)
      case "completed":
        return {
          icon: CheckCircle,
          label: "Completed",
          variant: "default" as const,
          className: "bg-success/20 text-success border-success/30",
        };
      case "in-progress":
        return {
          icon: Clock,
          label: "In Progress",
          variant: "secondary" as const,
          className: "bg-warning/20 text-warning border-warning/30",
        };
      case "pending":
        return {
          icon: AlertCircle,
          label: "Pending",
          variant: "outline" as const,
          className: "bg-muted/20 text-muted-foreground border-muted",
        };
      default:
        return {
          icon: FileText,
          label: "Unknown",
          variant: "outline" as const,
          className: "bg-gray-500/20 text-gray-600 border-gray-500/30",
        };
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 gradient-hero">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="max-w-6xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Review
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}
                Dashboard
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Browse manuscripts under review and their AI-generated feedback
            </p>
            {!isConnected && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>💡 Connect your wallet</strong> to submit reviews and earn tokens for your feedback!
                </p>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or field..."
                className="pl-12 bg-secondary/50 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>


          {/* Reviews Grid */}
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Hardcoded Featured Manuscripts */}
            {mockReviews.map((review) => {
              const statusConfig = getStatusConfig(review.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={review.id} className="glass p-6 hover:border-primary/50 transition-all border-primary/20">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center glow">
                        <FileText className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <h3 className="text-xl font-semibold flex-1 min-w-0">{review.title}</h3>
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        By {review.authors}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-secondary/50">
                            {review.field}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {review.timestamp}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          {review.reviewCount} review{review.reviewCount !== 1 ? "s" : ""}
                        </div>
                        {review.status === "completed" && (
                          <div className="flex items-center gap-1 text-accent">
                            <Star className="w-4 h-4 fill-accent" />
                            {review.rating}/5.0
                          </div>
                        )}
                      </div>

                      {review.status === "completed" && (
                        <div className="glass rounded-lg p-4 mb-4 border border-primary/20">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">AI Summary:</span> This research
                            presents a novel approach with strong methodology. The experimental results are
                            well-documented and conclusions are supported by data. Minor improvements suggested
                            in the literature review section.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            // Create a mock manuscript object for hardcoded reviews
                            const mockManuscript = {
                              _id: `mock_${review.id}`,
                              title: review.title,
                              authors: review.authors,
                              abstract: "This is a featured manuscript for demonstration purposes.",
                              researchField: review.field,
                              keywords: [review.field.toLowerCase()],
                              status: review.status,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              authorId: {
                                _id: `author_${review.id}`,
                                name: review.authors.split(',')[0],
                                walletAddress: '0x0000000000000000000000000000000000000000',
                                institution: 'Demo University',
                                researchField: review.field
                              },
                              reviews: []
                            };
                            handleViewDetails(mockManuscript);
                          }}
                        >
                          View Details
                        </Button>
                        {review.status !== "completed" && isConnected && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Create a mock manuscript object for hardcoded reviews
                              const mockManuscript = {
                                _id: `mock_${review.id}`,
                                title: review.title,
                                authors: review.authors,
                                abstract: "This is a featured manuscript for demonstration purposes.",
                                researchField: review.field,
                                keywords: [review.field.toLowerCase()],
                                status: review.status,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                authorId: {
                                  _id: `author_${review.id}`,
                                  name: review.authors.split(',')[0],
                                  walletAddress: '0x0000000000000000000000000000000000000000',
                                  institution: 'Demo University',
                                  researchField: review.field
                                },
                                reviews: []
                              };
                              handleOpenReviewModal(mockManuscript);
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Add Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Real Manuscripts from Backend */}
            {!isLoading && filteredManuscripts.length > 0 && (
              <>
                {/* Separator */}
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <Badge variant="outline" className="px-4 py-2">
                    Recent Submissions
                  </Badge>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>

                {filteredManuscripts.map((manuscript) => {
                  const statusConfig = getStatusConfig(manuscript.status);
                  const StatusIcon = statusConfig.icon;
                  const reviewCount = getReviewCount(manuscript.reviews);
                  const averageRating = getAverageRating(manuscript.reviews);
                  const timeAgo = getTimeAgo(manuscript.createdAt);

                  return (
                    <Card key={manuscript._id} className="glass p-6 hover:border-primary/50 transition-all">
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center glow">
                            <FileText className="w-8 h-8" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start gap-3 mb-3">
                            <h3 className="text-xl font-semibold flex-1 min-w-0">{manuscript.title}</h3>
                            <Badge className={statusConfig.className}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            By {manuscript.authors}
                          </p>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {manuscript.abstract}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-secondary/50">
                                {manuscript.researchField}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {timeAgo}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                            </div>
                            {(manuscript.status === "reviewed" || manuscript.status === "published") && averageRating !== "0" && (
                              <div className="flex items-center gap-1 text-accent">
                                <Star className="w-4 h-4 fill-accent" />
                                {averageRating}/5.0
                              </div>
                            )}
                          </div>

                          {/* Keywords */}
                          {manuscript.keywords && manuscript.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {manuscript.keywords.slice(0, 3).map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {manuscript.keywords.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{manuscript.keywords.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleViewDetails(manuscript)}
                            >
                              View Details
                            </Button>
                            {(manuscript.status === "submitted" || manuscript.status === "under_review") && isConnected && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenReviewModal(manuscript)}
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Add Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </>
            )}

            {/* Show loading state only for real manuscripts */}
            {isLoading && (
              <Card className="glass p-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading recent submissions...</p>
                </div>
              </Card>
            )}

            {/* Show no results message only if no real manuscripts and not loading */}
            {!isLoading && filteredManuscripts.length === 0 && (
              <Card className="glass p-8">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No recent submissions found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No manuscripts have been submitted yet.'}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Review</DialogTitle>
            <DialogDescription>
              Review: {selectedManuscript?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                    className={`w-8 h-8 ${
                      star <= reviewFormData.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-full h-full" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {reviewFormData.rating}/5 stars
                </span>
              </div>
            </div>

            {/* Summary */}
            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={reviewFormData.summary}
                onChange={(e) => setReviewFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary of your review..."
                rows={3}
                className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
                required
              />
            </div>

            {/* Detailed Feedback */}
            <div>
              <Label htmlFor="detailedFeedback">Detailed Feedback</Label>
              <Textarea
                id="detailedFeedback"
                value={reviewFormData.detailedFeedback}
                onChange={(e) => setReviewFormData(prev => ({ ...prev, detailedFeedback: e.target.value }))}
                placeholder="Detailed feedback on methodology, results, conclusions, etc..."
                rows={5}
                className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setReviewModalOpen(false)}
                disabled={isSubmittingReview}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || !reviewFormData.summary.trim() || !reviewFormData.detailedFeedback.trim()}
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manuscript Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedManuscriptForDetails?.title}</DialogTitle>
            <DialogDescription>
              By {selectedManuscriptForDetails?.authors}
            </DialogDescription>
          </DialogHeader>
          {selectedManuscriptForDetails && (
            <div className="space-y-6">
              {/* Status and Info */}
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                  {selectedManuscriptForDetails.status === 'submitted' ? 'Submitted' : 'Under Review'}
                </Badge>
                <Badge variant="outline" className="bg-secondary/50">
                  {selectedManuscriptForDetails.researchField}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {getTimeAgo(selectedManuscriptForDetails.createdAt)}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {getReviewCount(selectedManuscriptForDetails.reviews)} review{getReviewCount(selectedManuscriptForDetails.reviews) !== 1 ? "s" : ""}
                </div>
                {selectedManuscriptForDetails.status === "reviewed" && getAverageRating(selectedManuscriptForDetails.reviews) !== "0" && (
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="w-4 h-4 fill-accent" />
                    {getAverageRating(selectedManuscriptForDetails.reviews)}/5.0
                  </div>
                )}
              </div>

              {/* Abstract */}
              <div>
                <h3 className="font-semibold mb-2">Abstract</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedManuscriptForDetails.abstract}
                </p>
              </div>

              {/* Keywords */}
              {selectedManuscriptForDetails.keywords && selectedManuscriptForDetails.keywords.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedManuscriptForDetails.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Info */}
              <div>
                <h3 className="font-semibold mb-2">Author Information</h3>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p><strong>Name:</strong> {selectedManuscriptForDetails.authorId.name}</p>
                  <p><strong>Institution:</strong> {selectedManuscriptForDetails.authorId.institution}</p>
                  <p><strong>Research Field:</strong> {selectedManuscriptForDetails.authorId.researchField}</p>
                </div>
              </div>

              {/* Reviews */}
              {selectedManuscriptForDetails.reviews && selectedManuscriptForDetails.reviews.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Reviews ({selectedManuscriptForDetails.reviews.length})</h3>
                  <div className="space-y-4">
                    {selectedManuscriptForDetails.reviews.map((review, index) => (
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
                              by {review.reviewerId?.name || 'Anonymous'}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.summary}</p>
                        {review.detailedFeedback && (
                          <p className="text-sm">{review.detailedFeedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
                {(selectedManuscriptForDetails.status === "submitted" || selectedManuscriptForDetails.status === "under_review") && isConnected && (
                  <Button onClick={() => {
                    setDetailsModalOpen(false);
                    handleOpenReviewModal(selectedManuscriptForDetails);
                  }}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Review
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Reviews;
