import { BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Color palette matching the PDF charts
const COLORS = {
  primary: '#f97316', // orange-500
  secondary: '#14b8a6', // teal-500
  tertiary: '#3b82f6', // blue-500
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  gray: '#6b7280', // gray-500
};

interface GBPScoreChartProps {
  score: number;
  issues: string[];
  improvements: string[];
}

export function GBPScoreChart({ score, issues, improvements }: GBPScoreChartProps) {
  const data = [
    { name: 'Current Score', value: score, fill: COLORS.primary },
    { name: 'Potential', value: 100 - score, fill: '#e5e7eb' },
  ];

  const issueData = [
    { category: 'Critical Issues', count: issues.filter(i => i.toLowerCase().includes('missing') || i.toLowerCase().includes('no ')).length },
    { category: 'Improvements', count: improvements.length },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>GBP Optimization Score</CardTitle>
        <CardDescription>Current performance vs. potential</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Gauge */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <div className="text-4xl font-bold text-orange-500">{score}/100</div>
              <div className="text-sm text-gray-600">Optimization Score</div>
            </div>
          </div>

          {/* Issue Breakdown */}
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={issueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.danger} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4 text-sm text-gray-600">
              Issues to Address
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RankingsChartProps {
  rankings: Array<{ keyword: string; position: number | null }>;
}

export function RankingsChart({ rankings }: RankingsChartProps) {
  // Filter out null positions and prepare data
  const validRankings = rankings
    .filter(r => r.position !== null)
    .map(r => ({
      keyword: r.keyword.length > 20 ? r.keyword.substring(0, 20) + '...' : r.keyword,
      position: r.position,
      // Invert position for better visualization (lower position = higher on chart)
      score: r.position ? Math.max(0, 100 - (r.position * 5)) : 0,
    }))
    .slice(0, 10); // Show top 10

  if (validRankings.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Search Rankings</CardTitle>
          <CardDescription>Keyword position analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No ranking data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Search Rankings</CardTitle>
        <CardDescription>Top keyword positions (lower is better)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={validRankings} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} label={{ value: 'Ranking Score', position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="keyword" width={150} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold">{payload[0].payload.keyword}</p>
                      <p className="text-sm text-gray-600">Position: #{payload[0].payload.position}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" fill={COLORS.secondary} radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface WebsiteAnalysisChartProps {
  seoScore: number;
  technicalScore: number;
  contentScore: number;
  localScore: number;
}

export function WebsiteAnalysisChart({ seoScore, technicalScore, contentScore, localScore }: WebsiteAnalysisChartProps) {
  const data = [
    { subject: 'SEO', score: seoScore, fullMark: 100 },
    { subject: 'Technical', score: technicalScore, fullMark: 100 },
    { subject: 'Content', score: contentScore, fullMark: 100 },
    { subject: 'Local', score: localScore, fullMark: 100 },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Website Analysis</CardTitle>
        <CardDescription>Multi-dimensional performance assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Score" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {data.map((item) => (
            <div key={item.subject} className="text-center">
              <div className="text-2xl font-bold text-orange-500">{item.score}</div>
              <div className="text-sm text-gray-600">{item.subject}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CompetitorChartProps {
  competitors: Array<{ name: string; gbpScore: number; seoScore: number; visibility: number }>;
  businessName: string;
}

export function CompetitorChart({ competitors, businessName }: CompetitorChartProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Competitive Analysis</CardTitle>
          <CardDescription>How you compare to local competitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No competitor data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Competitive Analysis</CardTitle>
        <CardDescription>How you compare to local competitors</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={competitors}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="gbpScore" name="GBP Score" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
            <Bar dataKey="seoScore" name="SEO Score" fill={COLORS.secondary} radius={[8, 8, 0, 0]} />
            <Bar dataKey="visibility" name="Visibility" fill={COLORS.tertiary} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ROIProjectionChartProps {
  currentLeads: number;
  projectedLeads: number;
  avgRevenue: number;
}

export function ROIProjectionChart({ currentLeads, projectedLeads, avgRevenue }: ROIProjectionChartProps) {
  const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
  
  const data = months.map((month, index) => {
    const progress = (index + 1) / 6; // Linear growth over 6 months
    const leads = currentLeads + (projectedLeads - currentLeads) * progress;
    const revenue = leads * avgRevenue;
    
    return {
      month,
      leads: Math.round(leads),
      revenue: Math.round(revenue),
    };
  });

  const totalIncrease = (projectedLeads - currentLeads) * avgRevenue * 6;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>ROI Projection</CardTitle>
        <CardDescription>6-month revenue growth potential</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-teal-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">
              ${totalIncrease.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Projected 6-Month Revenue Increase
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" label={{ value: 'Monthly Leads', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'revenue') {
                  return [`$${value.toLocaleString()}`, 'Revenue'];
                }
                return [value, 'Leads'];
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="leads" stroke={COLORS.secondary} strokeWidth={3} dot={{ r: 5 }} name="Monthly Leads" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 5 }} name="Monthly Revenue" />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <div className="text-xl font-bold text-gray-700">{currentLeads}</div>
            <div className="text-sm text-gray-600">Current Leads/Mo</div>
          </div>
          <div>
            <div className="text-xl font-bold text-teal-500">{projectedLeads}</div>
            <div className="text-sm text-gray-600">Projected Leads/Mo</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-500">+{Math.round(((projectedLeads - currentLeads) / currentLeads) * 100)}%</div>
            <div className="text-sm text-gray-600">Growth</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
