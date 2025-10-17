import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Submit = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    toast.success("Manuscript submitted successfully!");
  };

  if (submitted) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 gradient-hero flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 glow">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Submission Successful!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Your manuscript has been submitted for AI-powered peer review. The review process has been initiated and recorded on-chain.
              </p>
              <div className="glass rounded-2xl p-6 mb-8">
                <div className="text-sm text-muted-foreground mb-2">Transaction Hash</div>
                <code className="text-sm text-accent font-mono">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb</code>
              </div>
              <Button variant="hero" onClick={() => setSubmitted(false)}>
                Submit Another Paper
              </Button>
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
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Submit Your
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {" "}
                  Manuscript
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Upload your research paper for AI-powered peer review on the blockchain
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="glass p-8 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">
                    Paper Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter the title of your research paper"
                    required
                    className="bg-secondary/50"
                  />
                </div>

                {/* Authors */}
                <div className="space-y-2">
                  <Label htmlFor="authors" className="text-base">
                    Authors *
                  </Label>
                  <Input
                    id="authors"
                    placeholder="e.g., John Doe, Jane Smith"
                    required
                    className="bg-secondary/50"
                  />
                </div>

                {/* Abstract */}
                <div className="space-y-2">
                  <Label htmlFor="abstract" className="text-base">
                    Abstract *
                  </Label>
                  <Textarea
                    id="abstract"
                    placeholder="Provide a brief abstract of your research"
                    rows={6}
                    required
                    className="bg-secondary/50 resize-none"
                  />
                </div>

                {/* Research Field */}
                <div className="space-y-2">
                  <Label htmlFor="field" className="text-base">
                    Research Field *
                  </Label>
                  <Input
                    id="field"
                    placeholder="e.g., Computer Science, Biology, Physics"
                    required
                    className="bg-secondary/50"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-base">
                    Upload Manuscript (PDF) *
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-secondary/30">
                    <input
                      id="file"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      required
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF files up to 50MB
                      </p>
                    </label>
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-base">
                    Keywords
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., machine learning, blockchain, peer review"
                    className="bg-secondary/50"
                  />
                </div>

                {/* Info Box */}
                <div className="glass rounded-xl p-4 border border-primary/30">
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">What happens next?</p>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Your manuscript hash will be recorded on Ethereum</li>
                        <li>AI agents will analyze and generate review feedback</li>
                        <li>Reviews will be stored on-chain with timestamps</li>
                        <li>You'll receive notifications of review progress</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Submit for Review
                </Button>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Submit;
