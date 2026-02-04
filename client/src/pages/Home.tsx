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
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-black" />
            </div>
            <span className="text-xl font-bold">eighty5labs</span>
          </div>
          <Button 
            onClick={() => setLocation("/audit")}
            className="bg-[#FF6B35] hover:bg-[#E55A2A] text-white font-semibold rounded-full px-6"
          >
            Get Your Free Audit
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle pastel mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-cyan-50/20 to-pink-50/30 -z-10" />
        
        <div className="container py-20 md:py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Stop losing revenue to
            <br />
            <span className="text-gray-400">faster systems.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto">
            Discover exactly where your local business is leaking revenue—and how to capture it with AI-powered visibility, 
            lead capture, and automated follow-up.
          </p>
          <Button 
            onClick={() => setLocation("/audit")}
            size="lg"
            className="bg-[#FF6B35] hover:bg-[#E55A2A] text-white text-lg px-8 py-6 rounded-full font-semibold"
          >
            Get Your Free Audit <ArrowRight className="ml-2" />
          </Button>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {[
              { value: "62%", label: "LEAD CHURN", sublabel: "Leads go cold in 30 min" },
              { value: "40%", label: "MISSED CALLS", sublabel: "Average small business" },
              { value: "88%", label: "TRUST REVIEWS", sublabel: "As much as referrals" },
              { value: "3.2x", label: "ROI AVERAGE", sublabel: "90-day results" },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="text-5xl font-black mb-2">{stat.value}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500">{stat.sublabel}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Reality Section */}
      <section className="bg-white py-20 border-t">
        <div className="container">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">The Reality</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl leading-tight">
            You're not losing to better competitors.
            <br />
            <span className="text-gray-400">You're losing to faster systems.</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl">
            Your team checks voicemail once a day. Your competitor's AI checked it 47 times while you were at lunch.
          </p>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What We Analyze</h2>
          <p className="text-xl text-gray-600">
            Six critical areas where local businesses leak revenue
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Search,
              title: "SEO + AEO Visibility",
              description: "How often you appear when ideal customers search—in Google AND in AI tools like ChatGPT.",
            },
            {
              icon: Target,
              title: "Competitive Position",
              description: "Why competitors outrank you and what trust signals they have that you don't.",
            },
            {
              icon: TrendingUp,
              title: "Website Conversion",
              description: "Whether visitors know what to do next and how easy it is to contact or book.",
            },
            {
              icon: MessageSquare,
              title: "Lead Capture & Response",
              description: "How many calls and messages slip through gaps and how fast you respond.",
            },
            {
              icon: Users,
              title: "Follow-Up Systems",
              description: "Whether leads get one attempt or structured, multi-touch nurture sequences.",
            },
            {
              icon: BarChart3,
              title: "Revenue Opportunity",
              description: "Specific, dollar-value estimates of what fixing these gaps could mean for your business.",
            },
          ].map((item, i) => (
            <Card key={i} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <item.icon className="w-12 h-12 mb-4 text-[#FF6B35]" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-gray-50 py-20 border-y">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What You Get</h2>
            <p className="text-xl text-gray-600">
              A comprehensive, data-driven revenue recapture report
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
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
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-[#FF6B35]" />
                <span className="text-lg text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          See what's possible for your business
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Every business is different. Get a personalized audit showing exactly how much revenue you're leaving 
          on the table—and how to capture it.
        </p>
        <Button 
          onClick={() => setLocation("/audit")}
          size="lg"
          className="bg-[#FF6B35] hover:bg-[#E55A2A] text-white text-lg px-8 py-6 rounded-full font-semibold"
        >
          Get Your Free Audit <ArrowRight className="ml-2" />
        </Button>
        <p className="text-sm text-gray-500 mt-4">No commitment required • Takes 2 minutes</p>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container text-center text-gray-600">
          <p className="mb-2">
            <strong className="text-black">eighty5labs</strong> — Agentic Marketing Infrastructure
          </p>
          <p className="text-sm">
            Your marketing runs itself. Your revenue doesn't sleep.
          </p>
        </div>
      </footer>
    </div>
  );
}
