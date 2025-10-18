import React, { useState } from "react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ManuscriptSubmission } from "../components/ManuscriptSubmission";

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

            <Card className="glass p-8 space-y-6">
              {/* Manuscript Submission */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Submit Manuscript</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet using the button in the navigation bar above, then submit your manuscript below.
                </p>
                <ManuscriptSubmission />
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
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Submit;
