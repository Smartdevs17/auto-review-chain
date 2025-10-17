import { FileText, Sparkles, CheckCircle, Coins } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Submit Manuscript",
    description: "Upload your research paper to the platform. The manuscript hash is recorded on-chain for immutability.",
    number: "01",
  },
  {
    icon: Sparkles,
    title: "AI Analysis",
    description: "Autonomous AI agents analyze your paper, generating structured feedback and highlighting key insights.",
    number: "02",
  },
  {
    icon: CheckCircle,
    title: "On-Chain Review",
    description: "Reviews are stored on Ethereum with timestamps and ratings, creating a transparent audit trail.",
    number: "03",
  },
  {
    icon: Coins,
    title: "Earn Rewards",
    description: "Reviewers receive ERC-20 tokens and build reputation scores for quality contributions.",
    number: "04",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}
              Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A seamless workflow powered by AI and blockchain technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent"></div>
                )}

                <div className="glass rounded-2xl p-6 text-center hover:border-primary/50 transition-all group">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full gradient-primary flex items-center justify-center font-bold text-lg glow">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-secondary mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
