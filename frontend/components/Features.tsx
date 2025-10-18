import { Brain, Database, Users, TrendingUp, Lock, GitBranch } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Review Agent",
    description: "Autonomous agents powered by GPT-4 analyze manuscripts, highlight key findings, and generate structured feedback.",
    gradient: "gradient-primary",
    glow: "glow",
  },
  {
    icon: Database,
    title: "On-Chain Ledger",
    description: "All reviews, ratings, and timestamps stored immutably on Ethereum for complete transparency and trust.",
    gradient: "gradient-accent",
    glow: "glow-accent",
  },
  {
    icon: Users,
    title: "Reputation System",
    description: "Build your on-chain profile with verifiable reviews and community ratings visible to all.",
    gradient: "gradient-primary",
    glow: "glow",
  },
  {
    icon: TrendingUp,
    title: "Token Rewards",
    description: "Earn ERC-20 tokens automatically for quality reviews through smart contract execution.",
    gradient: "gradient-accent",
    glow: "glow-accent",
  },
  {
    icon: Lock,
    title: "Tamper-Proof",
    description: "Cryptographic hashing ensures no review can be altered once submitted to the blockchain.",
    gradient: "gradient-primary",
    glow: "glow",
  },
  {
    icon: GitBranch,
    title: "Knowledge Graph",
    description: "Collaborative linking of papers, authors, and research topics creates a decentralized research network.",
    gradient: "gradient-accent",
    glow: "glow-accent",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Built for the Future of
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}
              Research
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Combining cutting-edge AI with blockchain technology to solve the fundamental challenges of academic peer review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass rounded-2xl p-8 hover:border-primary/50 transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.glow}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
