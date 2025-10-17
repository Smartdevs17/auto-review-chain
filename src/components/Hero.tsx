import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Coins } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8 glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-foreground">
              Powered by AI & Ethereum
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Decentralized AI
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Peer Review
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Revolutionizing academic publishing with autonomous AI agents, blockchain transparency, and tokenized incentives.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/submit">
              <Button variant="hero" size="lg" className="gap-2 text-base">
                Submit Paper
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/reviews">
              <Button variant="outline" size="lg" className="gap-2 text-base">
                View Reviews
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-6 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform glow">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Immutable</h3>
              <p className="text-sm text-muted-foreground">
                Reviews stored on-chain with tamper-proof transparency
              </p>
            </div>

            <div className="glass rounded-2xl p-6 hover:border-accent/50 transition-all group">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform glow-accent">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Autonomous agents automate review generation and analysis
              </p>
            </div>

            <div className="glass rounded-2xl p-6 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform glow">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Token Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Earn ERC-20 tokens for high-quality peer reviews
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
