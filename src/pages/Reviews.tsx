import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Clock, CheckCircle, AlertCircle, Search, Star } from "lucide-react";

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

const Reviews = () => {
  const getStatusConfig = (status: string) => {
    switch (status) {
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
          className: "",
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

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or field..."
                className="pl-12 bg-secondary/50 h-12"
              />
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="max-w-6xl mx-auto space-y-6">
            {mockReviews.map((review) => {
              const statusConfig = getStatusConfig(review.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={review.id} className="glass p-6 hover:border-primary/50 transition-all">
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
                        <Button variant="default" size="sm">
                          View Details
                        </Button>
                        {review.status !== "completed" && (
                          <Button variant="outline" size="sm">
                            Add Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reviews;
