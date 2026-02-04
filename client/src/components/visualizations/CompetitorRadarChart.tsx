import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, TrendingUp, Trophy } from "lucide-react";

interface RadarChartDataPoint {
  metric: string;
  business: number;
  avgCompetitor: number;
  topCompetitor: number;
  fullMark: number;
}

interface CompetitorGap {
  metric: string;
  gap: number;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface CompetitorRadarChartProps {
  businessName: string;
  radarData: RadarChartDataPoint[];
  gaps: CompetitorGap[];
  overallScore: number;
  competitivePosition: 'leader' | 'competitive' | 'lagging' | 'critical';
  summary: string;
}

const COLORS = {
  business: '#FF6B5B',
  avgCompetitor: '#9CA3AF',
  topCompetitor: '#2DD4BF',
};

const positionConfig = {
  leader: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: Trophy,
    label: 'Market Leader',
  },
  competitive: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: TrendingUp,
    label: 'Competitive',
  },
  lagging: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: AlertTriangle,
    label: 'Needs Improvement',
  },
  critical: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertTriangle,
    label: 'Critical Gaps',
  },
};

const priorityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  high: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  low: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

export function CompetitorRadarChart({
  businessName,
  radarData,
  gaps,
  overallScore,
  competitivePosition,
  summary,
}: CompetitorRadarChartProps) {
  const position = positionConfig[competitivePosition];
  const PositionIcon = position.icon;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B5B]" />
              Deep Competitor Analysis
            </CardTitle>
            <CardDescription>
              10-Signal competitive benchmark against top 5 local competitors
            </CardDescription>
          </div>
          <Badge className={position.color}>
            <PositionIcon className="w-3 h-3 mr-1" />
            {position.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Score */}
        <div className="flex items-center justify-center gap-8 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#FF6B5B]">{overallScore}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Competitive Score</div>
          </div>
          <div className="h-12 w-px bg-gray-300 dark:bg-gray-700" />
          <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
            {summary}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <Radar
                name={businessName}
                dataKey="business"
                stroke={COLORS.business}
                fill={COLORS.business}
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Radar
                name="Avg Competitor"
                dataKey="avgCompetitor"
                stroke={COLORS.avgCompetitor}
                fill={COLORS.avgCompetitor}
                fillOpacity={0.2}
                strokeWidth={1}
                strokeDasharray="5 5"
              />
              <Radar
                name="Top Competitor"
                dataKey="topCompetitor"
                stroke={COLORS.topCompetitor}
                fill={COLORS.topCompetitor}
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-900 p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold mb-2">{data.metric}</p>
                        <div className="space-y-1 text-sm">
                          <p style={{ color: COLORS.business }}>
                            {businessName}: {data.business}%
                          </p>
                          <p style={{ color: COLORS.avgCompetitor }}>
                            Avg Competitor: {data.avgCompetitor}%
                          </p>
                          <p style={{ color: COLORS.topCompetitor }}>
                            Top Competitor: {data.topCompetitor}%
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Explanation */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.business }} />
            <span>Your Business</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-dashed" style={{ borderColor: COLORS.avgCompetitor }} />
            <span>Average Competitor</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.topCompetitor }} />
            <span>Top Competitor</span>
          </div>
        </div>

        {/* Gaps & Recommendations */}
        {gaps.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Priority Action Items
            </h4>
            <div className="space-y-3">
              {gaps.slice(0, 5).map((gap, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${priorityColors[gap.priority]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{gap.metric}</span>
                    <Badge variant="outline" className="text-xs">
                      {gap.gap > 0 ? `-${gap.gap}%` : `+${Math.abs(gap.gap)}%`} gap
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">{gap.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Gaps Message */}
        {gaps.length === 0 && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>No significant competitive gaps identified. Keep up the great work!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CompetitorRadarChart;
