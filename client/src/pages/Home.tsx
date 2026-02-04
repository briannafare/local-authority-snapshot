import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  TrendingUp, 
  Search, 
  Users, 
  MessageSquare, 
  Target, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container py-5 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B5B] to-[#2DD4BF] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              eighty5labs
            </span>
          </div>
          <Button 
            onClick={() => setLocation("/audit")}
            className="bg-gradient-to-r from-[#FF6B5B] to-[#E55A4A] hover:from-[#E55A4A] hover:to-[#D54939] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Get Your Free Audit
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`container py-24 md:py-32 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF6B5B]/10 to-[#2DD4BF]/10 border border-[#FF6B5B]/20 mb-8">
          <Sparkles className="w-4 h-4 text-[#FF6B5B]" />
          <span className="text-sm font-medium text-gray-700">AI-Powered Revenue Recovery</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
          Stop losing revenue to
          <br />
          <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
            faster systems.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Discover exactly where your local business is leaking revenue—and how to capture it with 
          <span className="font-semibold text-gray-900"> AI-powered visibility</span>, 
          <span className="font-semibold text-gray-900"> lead capture</span>, and 
          <span className="font-semibold text-gray-900"> automated follow-up</span>.
        </p>
        
        <Button 
          onClick={() => setLocation("/audit")}
          size="lg"
          className="bg-gradient-to-r from-[#FF6B5B] to-[#E55A4A] hover:from-[#E55A4A] hover:to-[#D54939] text-white text-lg px-10 py-7 rounded-full font-bold shadow-2xl hover:shadow-[#FF6B5B]/50 transition-all duration-300 hover:scale-105 group"
        >
          Get Your Free Audit 
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-5xl mx-auto">
          {[
            { value: "62%", label: "Lead Churn", sublabel: "Leads go cold in 30 min", color: "from-red-500/10 to-orange-500/10" },
            { value: "40%", label: "Missed Calls", sublabel: "Average small business", color: "from-orange-500/10 to-yellow-500/10" },
            { value: "88%", label: "Trust Reviews", sublabel: "As much as referrals", color: "from-teal-500/10 to-cyan-500/10" },
            { value: "3.2x", label: "ROI Average", sublabel: "90-day results", color: "from-cyan-500/10 to-blue-500/10" },
          ].map((stat, i) => (
            <Card 
              key={i} 
              className={`border-0 shadow-xl bg-gradient-to-br ${stat.color} backdrop-blur hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="pt-8 pb-6">
                <div className="text-5xl font-black mb-2 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">{stat.sublabel}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* The Reality Section */}
      <section className="bg-gradient-to-br from-white to-gray-50 py-24 md:py-32 border-y">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] animate-pulse" />
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">The Reality</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 max-w-4xl leading-tight tracking-tight">
            You're not losing to better competitors.
            <br />
            <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
              You're losing to faster systems.
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl leading-relaxed">
            Your team checks voicemail once a day. Your competitor's AI checked it 
            <span className="font-bold text-[#FF6B5B]"> 47 times</span> while you were at lunch.
          </p>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="container py-24 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">What We Analyze</h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            Six critical areas where local businesses leak revenue
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: "SEO + AEO Visibility",
              description: "How often you appear when ideal customers search—in Google AND in AI tools like ChatGPT.",
              gradient: "from-[#FF6B5B]/10 to-[#FF6B5B]/5",
              iconColor: "text-[#FF6B5B]",
            },
            {
              icon: Target,
              title: "Competitive Position",
              description: "Why competitors outrank you and what trust signals they have that you don't.",
              gradient: "from-[#2DD4BF]/10 to-[#2DD4BF]/5",
              iconColor: "text-[#2DD4BF]",
            },
            {
              icon: TrendingUp,
              title: "Website Conversion",
              description: "Whether visitors know what to do next and how easy it is to contact or book.",
              gradient: "from-purple-500/10 to-purple-500/5",
              iconColor: "text-purple-600",
            },
            {
              icon: MessageSquare,
              title: "Lead Capture & Response",
              description: "How many calls and messages slip through gaps and how fast you respond.",
              gradient: "from-blue-500/10 to-blue-500/5",
              iconColor: "text-blue-600",
            },
            {
              icon: Users,
              title: "Follow-Up Systems",
              description: "Whether leads get one attempt or structured, multi-touch nurture sequences.",
              gradient: "from-green-500/10 to-green-500/5",
              iconColor: "text-green-600",
            },
            {
              icon: BarChart3,
              title: "Revenue Opportunity",
              description: "Specific, dollar-value estimates of what fixing these gaps could mean for your business.",
              gradient: "from-orange-500/10 to-orange-500/5",
              iconColor: "text-orange-600",
            },
          ].map((item, i) => (
            <Card 
              key={i} 
              className={`border-0 shadow-xl bg-gradient-to-br ${item.gradient} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group`}
            >
              <CardContent className="pt-8 pb-6">
                <div className={`w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-gradient-to-br from-[#2DD4BF] via-[#14B8A6] to-[#0D9488] text-white py-24 md:py-32 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">What You Get</h2>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              A comprehensive, data-driven revenue recapture report
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              "Specific SEO and AI visibility scores with query-level data",
              "Competitive analysis showing why others outrank you",
              "Lead capture audit with exact gaps and missed opportunities",
              "AI-generated recommendations tailored to your niche",
              "Revenue opportunity estimates based on your business",
              "Phased implementation roadmap (Quick Wins → Systems → Scale)",
              "Clear pricing packages matched to your situation",
              "Stunning visual reports with charts and infographics",
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group"
              >
                <CheckCircle2 className="w-7 h-7 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-lg leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 md:py-32 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight tracking-tight">
          See what's possible for 
          <br />
          <span className="bg-gradient-to-r from-[#FF6B5B] to-[#2DD4BF] bg-clip-text text-transparent">
            your business
          </span>
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Every business is different. Get a personalized audit showing exactly how much revenue you're leaving 
          on the table—and how to capture it.
        </p>
        <Button 
          onClick={() => setLocation("/audit")}
          size="lg"
          className="bg-gradient-to-r from-[#FF6B5B] to-[#E55A4A] hover:from-[#E55A4A] hover:to-[#D54939] text-white text-lg px-10 py-7 rounded-full font-bold shadow-2xl hover:shadow-[#FF6B5B]/50 transition-all duration-300 hover:scale-105 group"
        >
          Get Your Free Audit 
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-sm text-gray-500 mt-6 font-medium">
          No commitment required • Takes 2 minutes
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B5B] to-[#2DD4BF] rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <strong className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              eighty5labs
            </strong>
          </div>
          <p className="text-gray-600 font-medium mb-2">
            Agentic Marketing Infrastructure
          </p>
          <p className="text-sm text-gray-500">
            Your marketing runs itself. Your revenue doesn't sleep.
          </p>
        </div>
      </footer>
    </div>
  );
}
