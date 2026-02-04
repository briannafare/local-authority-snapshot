import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Download, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp,
  AlertCircle,
  Target,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { GBPScoreChart, RankingsChart, WebsiteAnalysisChart, CompetitorChart, ROIProjectionChart } from "@/components/AuditCharts";

export default function Report() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const auditId = parseInt(params.id || "0");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const { data: audit, isLoading, error } = trpc.audits.getById.useQuery({ id: auditId });

  const sendEmailMutation = trpc.audits.sendEmail.useMutation({
    onSuccess: () => {
      toast.success("Report sent successfully! Check your inbox.");
      setEmailDialogOpen(false);
      setEmailInput("");
    },
    onError: (error) => {
      toast.error(`Failed to send email: ${error.message}`);
    },
  });

  const generatePDFMutation = trpc.audits.generatePDF.useMutation({
    onSuccess: (data) => {
      window.open(data.pdfUrl, "_blank");
      toast.success("PDF generated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to generate PDF: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF6B5B] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Generating Your Audit...</h2>
          <p className="text-gray-600">
            We're analyzing your business across 6 dimensions. This may take 1-2 minutes.
          </p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Audit Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the audit you're looking for.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (audit.status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF6B5B] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analyzing {audit.businessName}...</h2>
          <p className="text-gray-600 mb-4">
            We're running a comprehensive audit across SEO, AEO, competitive visibility, lead capture, and more.
          </p>
          <p className="text-sm text-gray-500">This page will automatically update when complete.</p>
        </div>
      </div>
    );
  }

  if (audit.status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Audit Failed</h2>
          <p className="text-gray-600 mb-4">Something went wrong while generating your audit.</p>
          <Button onClick={() => setLocation("/audit")}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Parse JSON fields
  const gbp = audit.gbpAuditResults ? JSON.parse(audit.gbpAuditResults) : null;
  const seo = audit.seoAuditResults ? JSON.parse(audit.seoAuditResults) : null;
  const competitive = audit.competitiveResults ? JSON.parse(audit.competitiveResults) : null;
  const aeo = audit.aeoResults ? JSON.parse(audit.aeoResults) : null;
  const leadCapture = audit.leadCaptureResults ? JSON.parse(audit.leadCaptureResults) : null;
  const followUp = audit.followUpResults ? JSON.parse(audit.followUpResults) : null;
  const keyFindings = audit.keyFindings ? JSON.parse(audit.keyFindings) : [];
  const recommendations = audit.recommendations ? JSON.parse(audit.recommendations) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Local Authority Snapshot</h1>
                <p className="text-sm text-gray-600">{audit.businessName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(true)}>
                <Mail className="w-4 h-4 mr-2" /> Email Report
              </Button>
              <Button 
                className="bg-[#FF6B5B] hover:bg-[#E55A4A]" 
                onClick={() => {
                  toast.info("Generating PDF... This may take a moment.");
                  generatePDFMutation.mutate({ auditId: audit.id });
                }}
                disabled={generatePDFMutation.isPending}
              >
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Data Sources Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container py-3 max-w-6xl">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-blue-900">Data Sources:</span>
            <div className="flex flex-wrap gap-3">
              {seo?.dataSource && (
                <Badge variant="outline" className={`
                  ${seo.dataSource === 'crawl' ? 'bg-green-100 border-green-300 text-green-800' : ''}
                  ${seo.dataSource === 'unavailable' ? 'bg-red-100 border-red-300 text-red-800' : ''}
                `}>
                  {seo.dataSource === 'crawl' ? '✓ Website: Real Data' : '⚠ Website: Unavailable'}
                </Badge>
              )}
              {gbp?.dataSource && (
                <Badge variant="outline" className={`
                  ${gbp.dataSource === 'gbp_url' || gbp.dataSource === 'gbp_search' ? 'bg-green-100 border-green-300 text-green-800' : ''}
                  ${gbp.dataSource === 'unavailable' ? 'bg-red-100 border-red-300 text-red-800' : ''}
                `}>
                  {gbp.dataSource !== 'unavailable' ? '✓ GBP: Real Data' : '⚠ GBP: Not Found'}
                </Badge>
              )}
              {seo?.rankingData && (
                <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800">
                  ⚠ Rankings: May be blocked by CAPTCHA
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12 max-w-6xl">
        {/* Title & Executive Summary */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Local Authority Snapshot: SEO + AEO Revenue Recapture Audit
          </h1>
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="outline" className="text-base py-1 px-3">
              {audit.primaryNiche}
            </Badge>
            <Badge variant="outline" className="text-base py-1 px-3">
              {audit.primaryLocation}
            </Badge>
            <Badge className="bg-[#2DD4BF] text-white text-base py-1 px-3">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Completed
            </Badge>
          </div>

          {audit.executiveSummary && (
            <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-gray-700">{audit.executiveSummary}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Key Findings */}
        {keyFindings.length > 0 && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-[#FF6B5B]" />
                Key Findings at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {keyFindings.map((finding: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Audit Scores Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Visibility: SEO + AEO</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {gbp && (
              <ScoreCard
                title="GBP Optimization"
                score={gbp.score}
                description="Google Business Profile"
              />
            )}
            {seo && (
              <ScoreCard
                title="Website Local SEO"
                score={seo.score}
                description="On-page optimization"
              />
            )}
            {aeo && (
              <ScoreCard
                title="AI Discoverability"
                score={aeo.score}
                description="ChatGPT, Gemini, Perplexity"
              />
            )}
          </div>

          {/* GBP Details */}
          {gbp && (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Google Business Profile Audit</CardTitle>
                <CardDescription>Optimization opportunities for Maps ranking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {gbp.issues && gbp.issues.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">Top Issues Hurting Ranking</h4>
                    <ul className="space-y-2">
                      {gbp.issues.slice(0, 10).map((issue: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {gbp.improvements && gbp.improvements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-[#2DD4BF]">Top Improvements</h4>
                    <ul className="space-y-2">
                      {gbp.improvements.slice(0, 10).map((improvement: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {gbp.optimizedDescription && (
                  <div>
                    <h4 className="font-semibold mb-3">Example Optimized Business Description</h4>
                    <p className="text-sm bg-gray-50 p-4 rounded-lg">{gbp.optimizedDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* GBP Score Chart */}
          {gbp && gbp.score && (
            <div className="mb-6">
              <GBPScoreChart 
                score={gbp.score} 
                issues={gbp.issues || []} 
                improvements={gbp.improvements || []} 
              />
            </div>
          )}

          {/* SEO Details */}
          {seo && (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Website Local SEO Audit</CardTitle>
                <CardDescription>On-page optimization and search visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {seo.queries && seo.queries.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Search Visibility Analysis</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Query</th>
                            <th className="text-left py-2">Organic</th>
                            <th className="text-left py-2">Map Pack</th>
                            <th className="text-left py-2">Competitors Above</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seo.queries.map((q: any, i: number) => (
                            <tr key={i} className="border-b">
                              <td className="py-2">{q.query}</td>
                              <td className="py-2">{q.organicPresence}</td>
                              <td className="py-2">{q.mapPackPresence}</td>
                              <td className="py-2">{q.competitorsAbove}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Real Ranking Data Section */}
                {seo.rankingData && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-[#FF6B5B]" />
                      <h4 className="font-semibold">Real Search Ranking Data</h4>
                      <Badge variant="outline" className="bg-[#2DD4BF]/10 text-[#14B8A6] border-[#2DD4BF]/30">
                        Live Data
                      </Badge>
                    </div>

                    {/* Ranking Summary */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {seo.rankingData.averagePosition !== null && (
                        <div className="bg-gradient-to-br from-[#FF6B5B]/10 to-[#FF6B5B]/20 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-[#FF6B5B]">
                            #{seo.rankingData.averagePosition.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Average Position</div>
                        </div>
                      )}
                      <div className={`p-4 rounded-lg ${
                        seo.rankingData.inLocalPack 
                          ? 'bg-gradient-to-br from-[#2DD4BF]/10 to-[#2DD4BF]/20' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100'
                      }`}>
                        <div className="text-2xl font-bold">
                          {seo.rankingData.inLocalPack ? '✓' : '✗'}
                        </div>
                        <div className="text-sm text-gray-600">Local Pack Presence</div>
                      </div>
                      {seo.rankingData.topCompetitors.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {seo.rankingData.topCompetitors.length}
                          </div>
                          <div className="text-sm text-gray-600">Top Competitors</div>
                        </div>
                      )}
                    </div>

                    {/* Query-Level Rankings */}
                    {seo.rankingData.queries && seo.rankingData.queries.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 text-sm">Position by Query</h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left py-2 px-3">Search Query</th>
                                <th className="text-center py-2 px-3">Your Position</th>
                                <th className="text-left py-2 px-3">Top Competitors</th>
                              </tr>
                            </thead>
                            <tbody>
                              {seo.rankingData.queries.map((q: any, i: number) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-3 font-medium">{q.query}</td>
                                  <td className="py-2 px-3 text-center">
                                    {q.position ? (
                                      <Badge 
                                        variant="outline" 
                                        className={`${
                                          q.position <= 3 
                                            ? 'bg-[#2DD4BF]/10 text-[#14B8A6] border-[#2DD4BF]/30' 
                                            : q.position <= 10 
                                            ? 'bg-[#FF6B5B]/10 text-[#E55A4A] border-[#FF6B5B]/30'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                        }`}
                                      >
                                        #{q.position}
                                      </Badge>
                                    ) : (
                                      <span className="text-gray-400">Not ranking</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-xs">
                                    {q.competitors && q.competitors.length > 0 ? (
                                      <div className="space-y-1">
                                        {q.competitors.slice(0, 2).map((c: any, ci: number) => (
                                          <div key={ci} className="text-gray-600">
                                            #{c.position}: {c.businessName}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">No data</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Rankings Chart */}
                    {seo.rankingData && seo.rankingData.queries && seo.rankingData.queries.length > 0 && (
                      <div className="mt-6">
                        <RankingsChart rankings={seo.rankingData.queries.map((q: any) => ({ keyword: q.query, position: q.position }))} />
                      </div>
                    )}
                  </div>
                )}

                {/* Visual Charts */}
                {audit.visuals && audit.visuals.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Visual Analytics</h3>
                    
                    {/* Score Gauges */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {audit.visuals
                        .filter((v: any) => v.visualType && v.visualType.includes('_score_gauge'))
                        .map((visual: any) => (
                          <div key={visual.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                            <img 
                              src={visual.imageUrl} 
                              alt={visual.description || visual.visualType} 
                              className="w-full h-auto"
                            />
                          </div>
                        ))
                      }
                    </div>
                    
                    {/* Comparison Charts */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {audit.visuals
                        .filter((v: any) => 
                          v.visualType && (
                            v.visualType === 'scores_comparison' || 
                            v.visualType === 'ranking_comparison' || 
                            v.visualType === 'ranking_heat_map'
                          )
                        )
                        .map((visual: any) => (
                          <div key={visual.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                            <img 
                              src={visual.imageUrl} 
                              alt={visual.description || visual.visualType} 
                              className="w-full h-auto"
                            />
                            {visual.description && (
                              <div className="p-3 bg-gray-50 text-sm text-gray-600">
                                {visual.description}
                              </div>
                            )}
                          </div>
                        ))
                      }
                    </div>
                    
                    {/* Revenue & Funnel Charts */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {audit.visuals
                        .filter((v: any) => 
                          v.visualType && (
                            v.visualType === 'revenue_opportunity' || 
                            v.visualType === 'conversion_funnel'
                          )
                        )
                        .map((visual: any) => (
                          <div key={visual.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                            <img 
                              src={visual.imageUrl} 
                              alt={visual.description || visual.visualType} 
                              className="w-full h-auto"
                            />
                            {visual.description && (
                              <div className="p-3 bg-gray-50 text-sm text-gray-600">
                                {visual.description}
                              </div>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {seo.weaknesses && seo.weaknesses.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">SEO Weaknesses</h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {seo.weaknesses.slice(0, 10).map((weakness: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {seo.improvements && seo.improvements.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-[#2DD4BF]">SEO Improvements</h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {seo.improvements.slice(0, 10).map((improvement: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#2DD4BF]">•</span>
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Website Analysis Chart */}
          {seo && seo.score && (
            <div className="mb-6">
              <WebsiteAnalysisChart 
                seoScore={seo.score || 0}
                technicalScore={seo.technicalScore || seo.score || 0}
                contentScore={seo.contentScore || seo.score || 0}
                localScore={seo.localScore || seo.score || 0}
              />
            </div>
          )}

          {/* AEO Details */}
          {aeo && (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Answer Engine Optimization (AEO)</CardTitle>
                <CardDescription>Visibility in AI tools like ChatGPT, Gemini, and Perplexity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {aeo.whyAIWouldRecommend && (
                    <div>
                      <h4 className="font-semibold mb-2 text-[#2DD4BF]">Why AI Would Recommend You</h4>
                      <p className="text-sm text-gray-700">{aeo.whyAIWouldRecommend}</p>
                    </div>
                  )}
                  {aeo.whyAIWouldNot && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Why AI Would NOT Recommend You</h4>
                      <p className="text-sm text-gray-700">{aeo.whyAIWouldNot}</p>
                    </div>
                  )}
                </div>

                {aeo.fixes && aeo.fixes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">10 Fixes to Improve AI Visibility</h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {aeo.fixes.map((fix: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-[#FF6B5B] flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aeo.exampleFAQ && (
                  <div>
                    <h4 className="font-semibold mb-3">Example FAQ Content AI Could Quote</h4>
                    <pre className="text-sm bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{aeo.exampleFAQ}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Competitive Analysis */}
        {competitive && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Competitive Visibility Analysis</CardTitle>
              <CardDescription>Why competitors outrank you and how to close the gap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {competitive.reasonsCompetitorsRank && competitive.reasonsCompetitorsRank.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">5 Reasons Competitors Rank Higher</h4>
                  <ul className="space-y-2">
                    {competitive.reasonsCompetitorsRank.map((reason: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#FF6B5B] font-bold">{i + 1}.</span>
                        <span className="text-sm">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {competitive.trustGaps && competitive.trustGaps.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Trust Signal Gaps</h4>
                  <ul className="space-y-2">
                    {competitive.trustGaps.map((gap: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lead Capture & AI Voice */}
        {leadCapture && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Lead Capture & AI Voice Opportunities</CardTitle>
              <CardDescription>How to capture every lead with AI-powered systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {leadCapture.channels && leadCapture.channels.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Current Lead Capture Channels</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Channel</th>
                          <th className="text-left py-2">Visibility</th>
                          <th className="text-left py-2">After Hours</th>
                          <th className="text-left py-2">Risk Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadCapture.channels.map((ch: any, i: number) => (
                          <tr key={i} className="border-b">
                            <td className="py-2">{ch.channel}</td>
                            <td className="py-2">{ch.visibility}</td>
                            <td className="py-2">{ch.afterHoursCoverage}</td>
                            <td className="py-2">
                              <Badge
                                variant={ch.riskLevel === "High" ? "destructive" : "outline"}
                                className={ch.riskLevel === "Medium" ? "bg-[#FF6B5B]/15 text-[#E55A4A]" : ""}
                              >
                                {ch.riskLevel}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {leadCapture.aiVoiceOpportunities && leadCapture.aiVoiceOpportunities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-[#2DD4BF]">AI Voice Agent Opportunities</h4>
                  <ul className="space-y-2">
                    {leadCapture.aiVoiceOpportunities.map((opp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {leadCapture.conversationAIOpportunities && leadCapture.conversationAIOpportunities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-[#FF6B5B]">Conversation AI Widget Opportunities</h4>
                  <ul className="space-y-2">
                    {leadCapture.conversationAIOpportunities.map((opp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF6B5B] flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ROI Projection Chart */}
        {audit.monthlyLeads && audit.avgRevenuePerClient && (
          <div className="mb-12">
            <ROIProjectionChart 
              currentLeads={audit.monthlyLeads || 10}
              projectedLeads={Math.round((audit.monthlyLeads || 10) * 1.5)} // 50% increase projection
              avgRevenue={audit.avgRevenuePerClient || 5000}
            />
          </div>
        )}

        {/* Revenue Recapture Summary */}
        {recommendations?.revenueRecapture && (
          <Card className="mb-12 border-0 shadow-lg bg-gradient-to-br from-[#FF6B5B]/10 to-[#2DD4BF]/10">
            <CardHeader>
              <CardTitle className="text-2xl">Revenue Recapture Summary</CardTitle>
              <CardDescription>Key opportunities to capture more revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.revenueRecapture.estimatedMonthlyRecovery && (
                <div className="bg-white rounded-lg p-6 mb-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Estimated Monthly Revenue Recovery</p>
                  <p className="text-5xl font-bold text-[#FF6B5B]">
                    ${recommendations.revenueRecapture.estimatedMonthlyRecovery.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Based on current lead volume and conversion gaps</p>
                </div>
              )}

              {recommendations.revenueRecapture.opportunities && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm bg-white rounded-lg">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Area</th>
                        <th className="text-left py-3 px-4">Key Issue</th>
                        <th className="text-left py-3 px-4">Impact</th>
                        <th className="text-left py-3 px-4">Revenue Upside</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendations.revenueRecapture.opportunities.map((opp: any, i: number) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 px-4 font-medium">{opp.area}</td>
                          <td className="py-3 px-4">{opp.keyIssue}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={opp.impactLevel === "High" ? "destructive" : "outline"}
                              className={opp.impactLevel === "Medium" ? "bg-[#FF6B5B]/15 text-[#E55A4A]" : ""}
                            >
                              {opp.impactLevel}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{opp.revenueUpside}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recommended Plan */}
        {recommendations?.recommendedPlan && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">{recommendations.recommendedPlan.planName}</h2>

            {/* Pillars */}
            {recommendations.recommendedPlan.pillars && recommendations.recommendedPlan.pillars.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {recommendations.recommendedPlan.pillars.map((pillar: any, i: number) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">{pillar.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4">{pillar.description}</p>
                      <ul className="space-y-1">
                        {pillar.outcomes.map((outcome: string, j: number) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Roadmap */}
            {recommendations.recommendedPlan.roadmap && (
              <Card className="mb-8 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Implementation Roadmap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(recommendations.recommendedPlan.roadmap).map(([key, phase]: [string, any]) => (
                    <div key={key}>
                      <h4 className="font-semibold text-lg mb-2">{phase.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                      <ul className="space-y-1">
                        {phase.items.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-[#FF6B5B]">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Pricing Packages */}
            {recommendations.recommendedPlan.pricingPackages && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Investment Options</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {recommendations.recommendedPlan.pricingPackages.map((pkg: any, i: number) => (
                    <Card key={i} className="border-2 border-gray-200 hover:border-[#FF6B5B] transition-colors">
                      <CardHeader>
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        <CardDescription>{pkg.focus}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-2xl font-bold text-[#FF6B5B]">{pkg.investmentRange}</p>
                        </div>
                        <ul className="space-y-2 mb-4">
                          {pkg.includes.map((item: string, j: number) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-600 italic">Ideal for: {pkg.idealFor}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#2DD4BF] to-[#14B8A6] text-white">
          <CardContent className="py-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Recapture Your Revenue?</h3>
            <p className="text-xl mb-8 text-white/80">
              Let's turn these insights into results. Schedule a strategy call with eighty5labs.
            </p>
            <Button size="lg" className="bg-white text-[#2DD4BF] hover:bg-gray-100 text-lg px-8 py-6">
              Schedule Strategy Call
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-12">
        <div className="container text-center text-gray-600">
          <p className="mb-2">
            <strong className="text-black">eighty5labs</strong> — Agentic Marketing Infrastructure
          </p>
          <p className="text-sm">Your marketing runs itself. Your revenue doesn't sleep.</p>
        </div>
      </footer>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Your Report</DialogTitle>
            <DialogDescription>
              Enter your email address to receive a copy of your audit report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
                  sendEmailMutation.mutate({ auditId: audit.id, email: emailInput });
                } else {
                  toast.error("Please enter a valid email address");
                }
              }}
              disabled={sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" /> Send Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreCard({ title, score, description }: { title: string; score: number; description: string }) {
  const getColor = (score: number) => {
    if (score >= 70) return "text-[#2DD4BF]";
    if (score >= 40) return "text-[#FF6B5B]";
    return "text-red-500";
  };

  return (
    <Card className="border-0 shadow-lg text-center">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className={`text-6xl font-bold mb-2 ${getColor(score)}`}>{score}</div>
        <p className="text-sm text-gray-500">/100</p>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}
