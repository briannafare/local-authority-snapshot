import { useState, useEffect } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { TeaserReport } from "@/components/TeaserReport";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { GeoGridHeatmap } from "@/components/visualizations/GeoGridHeatmap";
import { CompetitorRadarChart } from "@/components/visualizations/CompetitorRadarChart";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Report() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const auditId = parseInt(params.id || "0");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const { user } = useAuth();

  // Check URL params for access modes
  const searchParams = new URLSearchParams(searchString);
  const fullAccessParam = searchParams.get("full") === "true"; // Sales bypass: ?full=true
  const salesMode = searchParams.get("sales") === "true"; // Sales mode: ?sales=true (no lead wall)

  const { data: audit, isLoading, error, refetch } = trpc.audits.getById.useQuery({ id: auditId });

  const captureLeadMutation = trpc.audits.captureLead.useMutation({
    onSuccess: (data) => {
      toast.success("Report unlocked! Check your email for the PDF.");
      setShowLeadForm(false);
      refetch(); // Refresh audit data to show full report
    },
    onError: (error) => {
      toast.error(`Failed to unlock report: ${error.message}`);
    },
  });

  const generatePDFMutation = trpc.audits.generatePDF.useMutation({
    onSuccess: (data) => {
      // Open PDF in new tab for download
      window.open(data.pdfUrl, "_blank");
      toast.success("PDF ready for download!");
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
          <h2 className="text-2xl font-bold mb-2">Loading Your Audit...</h2>
          <p className="text-gray-600">Please wait while we retrieve your report.</p>
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
  const geoGridData = audit.geoGridData ? JSON.parse(audit.geoGridData) : null;
  const deepCompetitorAnalysis = audit.deepCompetitorAnalysis ? JSON.parse(audit.deepCompetitorAnalysis) : null;

  // Determine access level
  // Full access if: logged in user, sales mode, full param, or lead already captured
  const isLoggedIn = !!user;
  const leadCaptured = audit.fullReportUnlocked === 1 || !!audit.leadEmail;
  const isFullReport = isLoggedIn || salesMode || fullAccessParam || leadCaptured;

  // Calculate grade for teaser
  const overallGrade = (audit.overallGrade as 'A' | 'B' | 'C' | 'D' | 'F') || 'C';
  const overallScore = audit.overallScore || 50;

  // Competitor count from competitive data
  const competitorCount = competitive?.competitors?.length ||
    competitive?.reasonsCompetitorsRank?.length || 5;

  // Handle lead form submission
  const handleLeadSubmit = async (data: { name: string; email: string; phone: string }) => {
    await captureLeadMutation.mutateAsync({
      auditId: audit.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
  };

  // Show Lead Capture Form
  if (showLeadForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="container py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setShowLeadForm(false)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Local Authority Snapshot</h1>
                  <p className="text-sm text-gray-600">{audit.businessName}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-12 max-w-4xl">
          <LeadCaptureForm
            businessName={audit.businessName}
            onSubmit={handleLeadSubmit}
            isLoading={captureLeadMutation.isPending}
          />
        </div>
      </div>
    );
  }

  // Show Teaser Report for public visitors (no access)
  if (!isFullReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5">
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
            </div>
          </div>
        </header>

        <div className="container py-12 max-w-4xl">
          <TeaserReport
            businessName={audit.businessName}
            overallGrade={overallGrade}
            overallScore={overallScore}
            keyFindings={keyFindings}
            competitorCount={competitorCount}
            gbpScore={gbp?.score}
            seoScore={seo?.score}
            aeoScore={aeo?.score}
            emailSent={false}
            onRequestFullReport={() => setShowLeadForm(true)}
          />
        </div>
      </div>
    );
  }

  // Full Report below
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
              <Button 
                className="bg-[#FF6B5B] hover:bg-[#E55A4A]" 
                onClick={() => {
                  toast.info("Generating PDF... This may take a moment.");
                  generatePDFMutation.mutate({ auditId: audit.id });
                }}
                disabled={generatePDFMutation.isPending}
              >
                {generatePDFMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Download PDF</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sales Mode Indicator */}
      {(salesMode || isLoggedIn) && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container py-2 max-w-6xl">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">
                {isLoggedIn ? "Logged in - Full access enabled" : "Sales Mode - Lead wall bypassed"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Data Sources Banner */}
      <div className="bg-gray-50 border-b">
        <div className="container py-3 max-w-6xl">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-gray-700">Data Sources:</span>
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
                  ${gbp.dataSource === 'gbp_url' || gbp.dataSource === 'gbp_search' || gbp.dataSource === 'places_api' ? 'bg-green-100 border-green-300 text-green-800' : ''}
                  ${gbp.dataSource === 'unavailable' ? 'bg-red-100 border-red-300 text-red-800' : ''}
                `}>
                  {gbp.dataSource !== 'unavailable' ? '✓ GBP: Real Data' : '⚠ GBP: Not Found'}
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

        {/* Overall Score Card */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardContent className="pt-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center border-8 
                  ${overallGrade === 'A' ? 'bg-green-100 border-green-300 text-green-800' : ''}
                  ${overallGrade === 'B' ? 'bg-blue-100 border-blue-300 text-blue-800' : ''}
                  ${overallGrade === 'C' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : ''}
                  ${overallGrade === 'D' ? 'bg-orange-100 border-orange-300 text-orange-800' : ''}
                  ${overallGrade === 'F' ? 'bg-red-100 border-red-300 text-red-800' : ''}
                `}>
                  <div>
                    <div className="text-4xl font-bold">{overallGrade}</div>
                    <div className="text-sm">{overallScore}/100</div>
                  </div>
                </div>
                <p className="mt-2 font-semibold">Overall Grade</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FF6B5B]">{gbp?.score || '--'}</div>
                <p className="text-gray-600">GBP Score</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-[#2DD4BF]">{seo?.score || '--'}</div>
                <p className="text-gray-600">SEO Score</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{aeo?.score || '--'}</div>
                <p className="text-gray-600">AEO Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Findings */}
        {keyFindings.length > 0 && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-[#FF6B5B]" />
                Key Findings
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

        {/* GBP Analysis */}
        {gbp && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Google Business Profile Analysis</CardTitle>
              <CardDescription>Your visibility on Google Maps and local search</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Strengths</h4>
                  <ul className="space-y-2">
                    {gbp.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-700">Issues to Fix</h4>
                  <ul className="space-y-2">
                    {gbp.issues?.map((issue: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {gbp.improvements && gbp.improvements.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">Recommended Improvements</h4>
                  <ul className="space-y-2">
                    {gbp.improvements.slice(0, 5).map((imp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Zap className="w-4 h-4 text-[#FF6B5B] flex-shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* GeoGrid Heatmap */}
        {geoGridData && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Local Search Visibility Grid</CardTitle>
              <CardDescription>Your ranking at different locations across your service area</CardDescription>
            </CardHeader>
            <CardContent>
              <GeoGridHeatmap data={geoGridData} />
            </CardContent>
          </Card>
        )}

        {/* Competitive Analysis */}
        {competitive && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
              <CardDescription>How you compare to local competitors</CardDescription>
            </CardHeader>
            <CardContent>
              {competitive.reasonsCompetitorsRank && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Why Competitors Rank Higher</h4>
                  <ul className="space-y-2">
                    {competitive.reasonsCompetitorsRank.map((reason: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {competitive.trustGaps && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Trust Gaps to Address</h4>
                  <ul className="space-y-2">
                    {competitive.trustGaps.map((gap: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Deep Competitor Analysis */}
        {deepCompetitorAnalysis && deepCompetitorAnalysis.radarData && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Competitor Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your top competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitorRadarChart 
                businessName={audit.businessName}
                radarData={deepCompetitorAnalysis.radarData || []}
                gaps={deepCompetitorAnalysis.gaps || []}
                overallScore={deepCompetitorAnalysis.overallScore || 50}
                competitivePosition={deepCompetitorAnalysis.competitivePosition || 'competitive'}
                summary={deepCompetitorAnalysis.summary || ''}
              />
            </CardContent>
          </Card>
        )}

        {/* SEO Analysis */}
        {seo && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>SEO Analysis</CardTitle>
              <CardDescription>Website optimization for search engines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Strengths</h4>
                  <ul className="space-y-2">
                    {seo.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-700">Weaknesses</h4>
                  <ul className="space-y-2">
                    {seo.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AEO Analysis */}
        {aeo && (
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>AI Engine Optimization (AEO)</CardTitle>
              <CardDescription>Your visibility in AI assistants like ChatGPT, Gemini, and Perplexity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold text-purple-600">{aeo.score}/100</div>
                <p className="text-gray-600">AI Discoverability Score</p>
              </div>
              
              {aeo.fixes && aeo.fixes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recommended Fixes</h4>
                  <ul className="space-y-2">
                    {aeo.fixes.map((fix: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Zap className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations && (
          <Card className="mb-12 border-0 shadow-lg bg-gradient-to-br from-[#FF6B5B]/5 to-[#2DD4BF]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#FF6B5B]" />
                Action Plan
              </CardTitle>
              <CardDescription>Your prioritized roadmap to improved visibility</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.revenueRecapture && (
                <div className="mb-6 p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2">Revenue Opportunity</h4>
                  {typeof recommendations.revenueRecapture === 'string' ? (
                    <p className="text-gray-700">{recommendations.revenueRecapture}</p>
                  ) : recommendations.revenueRecapture.summary ? (
                    <p className="text-gray-700">{recommendations.revenueRecapture.summary}</p>
                  ) : recommendations.revenueRecapture.opportunities ? (
                    <ul className="space-y-3">
                      {recommendations.revenueRecapture.opportunities.slice(0, 3).map((opp: any, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Zap className="w-4 h-4 text-[#FF6B5B] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">{opp.area}:</span> {opp.keyIssue}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">Revenue opportunities identified in this audit.</p>
                  )}
                  {recommendations.revenueRecapture.estimatedMonthlyRecovery && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <span className="font-semibold text-green-800">Estimated Monthly Recovery: </span>
                      <span className="text-green-700">{recommendations.revenueRecapture.estimatedMonthlyRecovery}</span>
                    </div>
                  )}
                </div>
              )}
              
              {recommendations.recommendedPlan && (
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2">Recommended Plan</h4>
                  {typeof recommendations.recommendedPlan === 'string' ? (
                    <p className="text-gray-700">{recommendations.recommendedPlan}</p>
                  ) : recommendations.recommendedPlan.summary ? (
                    <p className="text-gray-700">{recommendations.recommendedPlan.summary}</p>
                  ) : recommendations.recommendedPlan.phases ? (
                    <ul className="space-y-3">
                      {recommendations.recommendedPlan.phases.slice(0, 3).map((phase: any, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Phase {i + 1}:</span> {phase.name || phase.description || phase}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">A customized implementation plan has been created for your business.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Download CTA */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-[#FF6B5B] to-[#E55A4A] text-white">
          <CardContent className="py-10 text-center">
            <Download className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-3">Download Your Full Report</h3>
            <p className="text-lg mb-6 opacity-90 max-w-md mx-auto">
              Get a PDF copy of this report to share with your team or reference later.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-[#FF6B5B] hover:bg-gray-100 text-lg px-8"
              onClick={() => {
                toast.info("Generating PDF... This may take a moment.");
                generatePDFMutation.mutate({ auditId: audit.id });
              }}
              disabled={generatePDFMutation.isPending}
            >
              {generatePDFMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Download className="w-5 h-5 mr-2" /> Download PDF Report</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
