import { TrendingUp } from "lucide-react";

const stats = [
  { value: "10K+", label: "Papers Reviewed", icon: "📄" },
  { value: "5K+", label: "Active Reviewers", icon: "👥" },
  { value: "50K+", label: "Tokens Distributed", icon: "🪙" },
  { value: "99.9%", label: "On-Chain Uptime", icon: "⚡" },
];

const Stats = () => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <div className="inline-flex items-center gap-2 text-success">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Growing 40% month over month</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
