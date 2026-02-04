import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Lock,
  Mail,
  Trophy,
  TrendingDown,
  TrendingUp,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

interface TeaserReportProps {
  businessName: string;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  overallScore: number;
  keyFindings: string[];
  competitorCount: number;
  gbpScore?: number;
  seoScore?: number;
  aeoScore?: number;
  onRequestFullReport: () => void;
  emailSent?: boolean;
}

const gradeConfig = {
  A: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Excellent', icon: Trophy },
  B: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Good', icon: TrendingUp },
  C: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Average', icon: Eye },
  D: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Needs Work', icon: TrendingDown },
  F: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Critical', icon: AlertCircle },
};

export function TeaserReport({
  businessName,
  overallGrade,
  overallScore,
  keyFindings,
  competitorCount,
  gbpScore,
  seoScore,
  aeoScore,
  onRequestFullReport,
  emailSent = false,
}: TeaserReportProps) {
  const grade = gradeConfig[overallGrade];
  const GradeIcon = grade.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Overall Grade Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Local Authority Snapshot</h1>
            <p className="text-gray-600 dark:text-gray-400">{businessName}</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className={`w-40 h-40 rounded-full flex items-center justify-center border-8 ${grade.color}`}>
                <div className="text-center">
                  <div className="text-5xl font-bold">{overallGrade}</div>
                  <div className="text-sm font-medium">{grade.label}</div>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary" className="text-sm">
                  Score: {overallScore}/100
                </Badge>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <ScorePreview label="GBP" score={gbpScore} />
            <ScorePreview label="SEO" score={seoScore} />
            <ScorePreview label="AEO" score={aeoScore} />
          </div>
        </CardContent>
      </Card>

      {/* Key Findings (Limited to 3) */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#FF6B5B]" />
            Top 3 Issues Hurting Your Visibility
          </CardTitle>
          <CardDescription>
            Based on our analysis of {competitorCount} competitors in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {keyFindings.slice(0, 3).map((finding, i) => (
              <li key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-gray-800 dark:text-gray-200">{finding}</span>
              </li>
            ))}
          </ul>

          {/* Blurred additional findings */}
          {keyFindings.length > 3 && (
            <div className="mt-4 relative">
              <div className="blur-sm pointer-events-none select-none">
                <ul className="space-y-4 opacity-60">
                  {keyFindings.slice(3, 6).map((finding, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">
                        {i + 4}
                      </span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Lock className="w-3 h-3 mr-2" />
                  +{keyFindings.length - 3} more findings in full report
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blurred GeoGrid Preview */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-gray-400" />
            Local Search Visibility Grid
          </CardTitle>
          <CardDescription>
            See exactly where you rank across your service area
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {/* Blurred placeholder grid */}
          <div className="blur-md pointer-events-none select-none opacity-60">
            <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
              {Array.from({ length: 25 }).map((_, i) => {
                const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-gray-400'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg ${randomColor} flex items-center justify-center text-white font-bold text-xs`}
                  >
                    {Math.floor(Math.random() * 15) + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-sm">
              <Lock className="w-8 h-8 mx-auto mb-3 text-[#FF6B5B]" />
              <h3 className="font-semibold mb-2">GeoGrid Heatmap</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                See your exact ranking at 25 points across your service area
              </p>
              <Badge variant="outline">Available in Full Report</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Preview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2DD4BF]" />
            Competitive Landscape
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="text-3xl font-bold text-[#2DD4BF]">{competitorCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Competitors</div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-sm">
                <Lock className="w-3 h-3 mr-1" />
                Full Analysis Locked
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            The full report includes detailed competitive analysis with 10-signal benchmarking,
            radar charts, and specific recommendations to outrank each competitor.
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-[#FF6B5B] to-[#E55A4A] text-white">
        <CardContent className="py-10 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-3">
            {emailSent ? 'Check Your Inbox!' : 'Get Your Full Report'}
          </h3>
          <p className="text-lg mb-6 opacity-90 max-w-md mx-auto">
            {emailSent
              ? 'Your complete Local Authority Snapshot has been sent to your email with the full GeoGrid, competitor analysis, and action plan.'
              : 'Unlock the complete analysis including GeoGrid heatmap, competitor breakdown, and customized action plan.'}
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-[#FF6B5B] hover:bg-gray-100 text-lg px-8"
            onClick={onRequestFullReport}
          >
            {emailSent ? 'View Full Report' : 'Send Full Report to My Email'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ScorePreview({ label, score }: { label: string; score?: number }) {
  const getColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className={`text-2xl font-bold ${getColor(score)}`}>
        {score ?? '--'}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

export default TeaserReport;
