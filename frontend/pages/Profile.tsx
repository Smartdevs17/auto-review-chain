import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Award, Coins, FileText, TrendingUp, Star, CheckCircle, Wallet, User, Trash2, Edit, MoreVertical } from "lucide-react";
import { UserRegistration } from "../components/UserRegistration";
import { useWallet } from "../contexts/WalletContext";
import { backendAPI, utils } from "../lib/api";
import { blockchainService } from "../lib/blockchain";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, userProfile, setUserProfile, isProfileLoading, refreshProfile, isBlockchainRegistered, checkBlockchainRegistration } = useWallet();
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [myManuscripts, setMyManuscripts] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [papersToReview, setPapersToReview] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    abstract: '',
    authors: '',
    researchField: '',
    keywords: '',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [manuscriptToDelete, setManuscriptToDelete] = useState<any>(null);


  // Ensure blockchain registration status is checked when component loads
  useEffect(() => {
    if (isConnected && walletAddress && isBlockchainRegistered === null) {
      checkBlockchainRegistration();
    }
  }, [isConnected, walletAddress, isBlockchainRegistered, checkBlockchainRegistration]);

  // Fetch token balance when wallet is connected
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (isConnected && walletAddress) {
        try {
          // Normalize address to lowercase for consistent API calls
          const normalizedAddress = utils.normalizeAddress(walletAddress);
          const response = await backendAPI.blockchain.getTokenBalance(normalizedAddress);
          setTokenBalance(response.balance || '0');
        } catch (error) {
          console.error('Error fetching token balance:', error);
          setTokenBalance('0');
        }
      }
    };

    fetchTokenBalance();
  }, [isConnected, walletAddress]);

  // Fetch user's manuscripts and reviews
  useEffect(() => {
    const fetchUserData = async () => {
      if (userProfile && userProfile._id) {
        setIsLoadingData(true);
        try {
          // Fetch user's manuscripts
          const manuscriptsResponse = await backendAPI.manuscripts.findAll(1, 50);
          const userManuscripts = manuscriptsResponse.manuscripts.filter(
            (manuscript: any) => manuscript.authorId._id === userProfile._id
          );
          setMyManuscripts(userManuscripts);

          // Fetch user's reviews
          const reviewsResponse = await backendAPI.reviews.findAll(1, 50);
          const userReviews = reviewsResponse.reviews.filter(
            (review: any) => review.reviewerId._id === userProfile._id
          );
          setMyReviews(userReviews);

          // Fetch papers available for review (manuscripts not by this user)
          const availableForReview = manuscriptsResponse.manuscripts.filter(
            (manuscript: any) => 
              manuscript.authorId._id !== userProfile._id && 
              (manuscript.status === 'submitted' || manuscript.status === 'under_review')
          );
          setPapersToReview(availableForReview);

        } catch (error) {
          console.error('Failed to fetch user data:', error);
          toast.error('Failed to load your data');
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchUserData();
  }, [userProfile]);

  const handleEditManuscript = (manuscript: any) => {
    setEditingManuscript(manuscript);
    setEditFormData({
      title: manuscript.title,
      abstract: manuscript.abstract,
      authors: manuscript.authors,
      researchField: manuscript.researchField,
      keywords: manuscript.keywords.join(', '),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateManuscript = async () => {
    if (!editingManuscript) return;

    try {
      const keywordsArray = editFormData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      await backendAPI.manuscripts.update(editingManuscript._id, {
        title: editFormData.title,
        abstract: editFormData.abstract,
        authors: editFormData.authors,
        researchField: editFormData.researchField,
        keywords: keywordsArray,
      });

      toast.success('Manuscript updated successfully!');
      setIsEditModalOpen(false);
      setEditingManuscript(null);
      
      // Refresh the data
      const manuscriptsResponse = await backendAPI.manuscripts.findAll(1, 50);
      const userManuscripts = manuscriptsResponse.manuscripts.filter(
        (manuscript: any) => manuscript.authorId._id === userProfile._id
      );
      setMyManuscripts(userManuscripts);
    } catch (error: any) {
      console.error('Failed to update manuscript:', error);
      toast.error(error.message || 'Failed to update manuscript');
    }
  };

  const handleDeleteManuscript = (manuscript: any) => {
    setManuscriptToDelete(manuscript);
    setDeleteModalOpen(true);
  };

  const confirmDeleteManuscript = async () => {
    if (!manuscriptToDelete) return;

    try {
      await backendAPI.manuscripts.delete(manuscriptToDelete._id);
      toast.success('Manuscript deleted successfully!');
      
      // Refresh the data
      const manuscriptsResponse = await backendAPI.manuscripts.findAll(1, 50);
      const userManuscripts = manuscriptsResponse.manuscripts.filter(
        (manuscript: any) => manuscript.authorId._id === userProfile._id
      );
      setMyManuscripts(userManuscripts);
      
      // Close modal and reset state
      setDeleteModalOpen(false);
      setManuscriptToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete manuscript:', error);
      toast.error(error.message || 'Failed to delete manuscript');
    }
  };

  const handleRemoveProfile = async () => {
    if (!userProfile || !walletAddress) {
      toast.error('No profile to remove');
      return;
    }

    // Confirm the action
    const confirmed = window.confirm(
      'Are you sure you want to remove your profile from the blockchain? This action cannot be undone and you will need to register again.'
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      toast.info('Please confirm the transaction in your wallet...');
      
      // Remove user from blockchain (user signs the transaction)
      const txHash = await blockchainService.removeCurrentUser('User requested profile removal');
      
      toast.success('Profile removed from blockchain! Updating local state...');
      
      // Record the transaction in backend
      await backendAPI.blockchain.recordTransaction({
        txHash,
        type: 'user_removal',
        userWalletAddress: walletAddress,
      });

      // Clear the user profile from frontend state
      setUserProfile(null);
      
      toast.success('Profile removed successfully! You can now register again if needed.');
      
    } catch (error) {
      console.error('Failed to remove profile:', error);
      toast.error(error.message || 'Failed to remove profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isConnected) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 gradient-hero flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow">
                <Wallet className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Connect your wallet to view your profile and manage your research activities
              </p>
              <Button variant="hero" size="lg" onClick={() => window.location.reload()}>
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show loading state while profile is being fetched
  if (isConnected && isProfileLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 gradient-hero flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow">
                <User className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Loading Profile...</h1>
              <p className="text-lg text-muted-foreground">
                Fetching your profile from the blockchain
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show registration form if user is not registered on blockchain
  // Priority: blockchain registration status over backend profile
  if (isConnected && !isProfileLoading && isBlockchainRegistered === false) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Registration Header */}
              <Card className="glass p-8 mb-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow">
                    <User className="w-10 h-10" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Welcome to PeerAI</h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    {isBlockchainRegistered === false 
                      ? "You're not registered on the blockchain yet. Complete your profile to get started."
                      : "Complete your profile registration to join the PeerAI community."
                    }
                  </p>
                  {isBlockchainRegistered === false && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                      <p className="text-warning text-sm">
                        ⚠️ Your wallet is connected but you're not registered on the blockchain. 
                        Please complete the registration below.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Registration Form */}
              <UserRegistration />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <Card className="glass p-8 mb-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold glow">
                    {userProfile ? getInitials(userProfile.name) : <User className="w-8 h-8" />}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold">
                      {userProfile ? userProfile.name : 'Welcome to PeerAI'}
                    </h1>
                    {userProfile?.isVerified && (
                    <Badge className="bg-success/20 text-success border-success/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified Reviewer
                    </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {userProfile 
                      ? `${userProfile.researchField} • ${userProfile.institution}` 
                      : 'Connect your wallet and register to start your research journey'
                    }
                  </p>
                  {userProfile?.expertise && (
                  <div className="flex flex-wrap gap-2">
                      {userProfile.expertise.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-secondary/50">
                          {skill}
                    </Badge>
                      ))}
                  </div>
                  )}
                </div>

                {/* Wallet Address */}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                  <code className="text-sm text-accent font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </code>
                </div>
              </div>
            </Card>

            {/* Conditional Content Based on Registration Status */}
            {userProfile ? (
              <>
                {/* Stats Grid - Only show for registered users */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass p-6 text-center hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 glow">
                  <FileText className="w-6 h-6" />
                </div>
                    <div className="text-3xl font-bold mb-1">
                      {userProfile.totalReviews || '0'}
                    </div>
                <div className="text-sm text-muted-foreground">Reviews Completed</div>
              </Card>

              <Card className="glass p-6 text-center hover:border-accent/50 transition-all">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3 glow-accent">
                  <Star className="w-6 h-6" />
                </div>
                    <div className="text-3xl font-bold mb-1">
                      {userProfile.totalReviews !== '0' ? '4.8' : '0.0'}
                    </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </Card>

              <Card className="glass p-6 text-center hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 glow">
                  <Coins className="w-6 h-6" />
                </div>
                    <div className="text-3xl font-bold mb-1">
                      {tokenBalance}
                    </div>
                    <div className="text-sm text-muted-foreground">Token Balance</div>
              </Card>

              <Card className="glass p-6 text-center hover:border-accent/50 transition-all">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3 glow-accent">
                  <TrendingUp className="w-6 h-6" />
                </div>
                    <div className="text-3xl font-bold mb-1">
                      {userProfile.reputationScore || '0'}
                    </div>
                <div className="text-sm text-muted-foreground">Reputation Score</div>
              </Card>
            </div>

                {/* My Manuscripts Under Review */}
            <Card className="glass p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    My Manuscripts Under Review
              </h2>
                  {isLoadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading your manuscripts...</p>
                    </div>
                  ) : myManuscripts.length > 0 ? (
              <div className="space-y-4">
                      {myManuscripts.slice(0, 3).map((manuscript) => (
                        <div
                          key={manuscript._id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1 mb-3 md:mb-0">
                            <h3 className="font-semibold mb-1">{manuscript.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {manuscript.researchField} • {new Date(manuscript.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                              {manuscript.status === 'submitted' ? 'Submitted' : 'Under Review'}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/submission/${manuscript._id}`)}
                            >
                              View Status
                            </Button>
                            {manuscript.status === 'submitted' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditManuscript(manuscript)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteManuscript(manuscript)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      ))}
                      {myManuscripts.length > 3 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" onClick={() => navigate('/reviews')}>
                            View All My Manuscripts ({myManuscripts.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No manuscripts submitted yet</h3>
                      <p className="text-muted-foreground mb-4">Start your research journey by submitting your first manuscript.</p>
                      <Button variant="hero" onClick={() => navigate('/submit')}>
                        Submit Your First Manuscript
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Papers I Review */}
                <Card className="glass p-8 mb-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Award className="w-6 h-6 text-accent" />
                    Papers Available for Review
                  </h2>
                  {isLoadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading available papers...</p>
                    </div>
                  ) : papersToReview.length > 0 ? (
                    <div className="space-y-4">
                      {papersToReview.slice(0, 3).map((manuscript) => (
                        <div
                          key={manuscript._id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-accent/30 transition-all"
                        >
                          <div className="flex-1 mb-3 md:mb-0">
                            <h3 className="font-semibold mb-1">{manuscript.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              By {manuscript.authors} • {manuscript.researchField} • {new Date(manuscript.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                              Needs Review
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate('/reviews')}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                      {papersToReview.length > 3 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" onClick={() => navigate('/reviews')}>
                            View All Available Papers ({papersToReview.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No papers available for review</h3>
                      <p className="text-muted-foreground">Check back later for new manuscripts to review.</p>
                    </div>
                  )}
                </Card>

                {/* My Recent Reviews */}
                <Card className="glass p-8 mb-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Star className="w-6 h-6 text-primary" />
                    My Recent Reviews
                  </h2>
                  {isLoadingData ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading your reviews...</p>
                    </div>
                  ) : myReviews.length > 0 ? (
                    <div className="space-y-4">
                      {myReviews.slice(0, 3).map((review) => (
                        <div
                          key={review._id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
                        >
                          <div className="flex-1 mb-3 md:mb-0">
                            <h3 className="font-semibold mb-1">{review.manuscriptId?.title || 'Review'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                              <span className="font-medium">{review.rating || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Coins className="w-4 h-4" />
                              <span className="font-medium">+{review.tokensEarned || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
                      {myReviews.length > 3 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" onClick={() => navigate('/reviews')}>
                            View All My Reviews ({myReviews.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No reviews completed yet</h3>
                      <p className="text-muted-foreground">Start reviewing papers to earn tokens and build your reputation.</p>
              </div>
                  )}
            </Card>

                {/* Actions - Only show for registered users */}
            <div className="flex flex-wrap gap-4">
                  <Button variant="hero" size="lg" onClick={() => navigate('/submit')}>
                    Submit New Manuscript
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={async () => {
                      await checkBlockchainRegistration();
                      await refreshProfile();
                    }}
                    disabled={isProfileLoading}
                  >
                    {isProfileLoading ? 'Refreshing...' : 'Refresh Profile'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={handleRemoveProfile}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isLoading ? 'Removing...' : 'Remove Profile'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Registration Section - Clean and focused for unregistered users */}
                <Card className="glass p-8 mb-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow">
                      <User className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Welcome to PeerAI!</h2>
                    <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Your wallet is connected! Complete your profile registration to start participating in the decentralized peer review ecosystem.
                    </p>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <UserRegistration />
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <h3 className="text-xl font-semibold mb-4 text-center">What happens after registration?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 glow">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="font-semibold mb-2">Submit Manuscripts</h4>
                        <p className="text-sm text-muted-foreground">Share your research with the community</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3 glow-accent">
                          <Star className="w-6 h-6" />
                        </div>
                        <h4 className="font-semibold mb-2">Review Research</h4>
                        <p className="text-sm text-muted-foreground">Provide expert feedback and earn tokens</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 glow">
                          <Coins className="w-6 h-6" />
                        </div>
                        <h4 className="font-semibold mb-2">Earn Rewards</h4>
                        <p className="text-sm text-muted-foreground">Build reputation and earn PAI tokens</p>
                      </div>
                    </div>
            </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Manuscript Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Manuscript</DialogTitle>
            <DialogDescription>
              Update your manuscript details. You can only edit manuscripts that are still in "Submitted" status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Manuscript title"
                className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-authors">Authors</Label>
              <Input
                id="edit-authors"
                value={editFormData.authors}
                onChange={(e) => setEditFormData(prev => ({ ...prev, authors: e.target.value }))}
                placeholder="Author names"
                className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-researchField">Research Field</Label>
              <Input
                id="edit-researchField"
                value={editFormData.researchField}
                onChange={(e) => setEditFormData(prev => ({ ...prev, researchField: e.target.value }))}
                placeholder="Research field"
                className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-keywords">Keywords (comma-separated)</Label>
              <Input
                id="edit-keywords"
                value={editFormData.keywords}
                onChange={(e) => setEditFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="edit-abstract">Abstract</Label>
              <Textarea
                id="edit-abstract"
                value={editFormData.abstract}
                onChange={(e) => setEditFormData(prev => ({ ...prev, abstract: e.target.value }))}
                placeholder="Manuscript abstract"
                rows={4}
                className="w-full bg-background border-input text-foreground placeholder:text-muted-foreground focus:bg-background focus:text-foreground"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateManuscript}>
                Update Manuscript
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Manuscript
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{manuscriptToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteModalOpen(false);
                setManuscriptToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteManuscript}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
