import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Coins, FileText, TrendingUp, Star, CheckCircle } from "lucide-react";

const Profile = () => {
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
                    JD
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold">Dr. Jane Doe</h1>
                    <Badge className="bg-success/20 text-success border-success/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified Reviewer
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Computer Science • Stanford University
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-secondary/50">
                      Machine Learning
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/50">
                      Blockchain
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/50">
                      Cryptography
                    </Badge>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                  <code className="text-sm text-accent font-mono">0x742d...0bEb</code>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass p-6 text-center hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 glow">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1">24</div>
                <div className="text-sm text-muted-foreground">Reviews Completed</div>
              </Card>

              <Card className="glass p-6 text-center hover:border-accent/50 transition-all">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3 glow-accent">
                  <Star className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1">4.8</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </Card>

              <Card className="glass p-6 text-center hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 glow">
                  <Coins className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1">1,250</div>
                <div className="text-sm text-muted-foreground">Tokens Earned</div>
              </Card>

              <Card className="glass p-6 text-center hover:border-accent/50 transition-all">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-3 glow-accent">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1">92</div>
                <div className="text-sm text-muted-foreground">Reputation Score</div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Recent Reviews
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Neural Networks in Climate Science",
                    rating: 5,
                    tokens: 75,
                    date: "2 days ago",
                  },
                  {
                    title: "Blockchain for Supply Chain Transparency",
                    rating: 4.5,
                    tokens: 60,
                    date: "1 week ago",
                  },
                  {
                    title: "Quantum Machine Learning Algorithms",
                    rating: 5,
                    tokens: 80,
                    date: "2 weeks ago",
                  },
                ].map((review, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1 mb-3 md:mb-0">
                      <h3 className="font-semibold mb-1">{review.title}</h3>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Coins className="w-4 h-4" />
                        <span className="font-medium">+{review.tokens}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg">
                View All Reviews
              </Button>
              <Button variant="outline" size="lg">
                Withdraw Tokens
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
