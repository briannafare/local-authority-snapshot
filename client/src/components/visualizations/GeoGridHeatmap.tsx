import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, MapPin, Trophy, Users, X } from "lucide-react";

// Types
export interface GeoGridPoint {
  lat: number;
  lng: number;
  rank: number | null;
  competitors: { name: string; rank: number }[];
  distance: string; // from business location
}

export interface GeoGridData {
  businessName: string;
  keyword: string;
  centerLat: number;
  centerLng: number;
  gridSize: 5 | 7;
  radius: number; // miles
  points: GeoGridPoint[][];
  averageRank: number;
  visibility: number; // percentage of grid where rank <= 3
}

// Color mapping based on rank
const getRankColor = (rank: number | null): string => {
  if (rank === null) return '#9CA3AF'; // gray - not found
  if (rank <= 3) return '#22C55E'; // green - top 3
  if (rank <= 10) return '#EAB308'; // yellow - 4-10
  if (rank <= 20) return '#EF4444'; // red - 11-20
  return '#9CA3AF'; // gray - beyond 20
};

const getRankLabel = (rank: number | null): string => {
  if (rank === null) return 'NF';
  return rank.toString();
};

interface CellDetailModalProps {
  point: GeoGridPoint;
  onClose: () => void;
  businessName: string;
}

function CellDetailModal({ point, onClose, businessName }: CellDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Grid Point Details</h3>
            <p className="text-sm text-gray-500">{point.distance} from center</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Rank Display */}
          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: getRankColor(point.rank) + '20' }}>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: getRankColor(point.rank) }}
            >
              {getRankLabel(point.rank)}
            </div>
            <div>
              <p className="font-semibold">{businessName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {point.rank === null ? 'Not found in top 20' : `Ranking #${point.rank}`}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{point.lat.toFixed(4)}, {point.lng.toFixed(4)}</span>
          </div>

          {/* Competitors */}
          {point.competitors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Top Competitors at this Location</span>
              </div>
              <div className="space-y-2">
                {point.competitors.slice(0, 3).map((comp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                      <span className="text-sm">{comp.name}</span>
                    </div>
                    <Badge variant="secondary">#{comp.rank}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface GeoGridHeatmapProps {
  data: GeoGridData;
  showBlurred?: boolean; // For teaser report
  onExportPNG?: (dataUrl: string) => void;
}

export function GeoGridHeatmap({ data, showBlurred = false, onExportPNG }: GeoGridHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<GeoGridPoint | null>(null);
  const [animatedCells, setAnimatedCells] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(true);

  const gridSize = data.gridSize;
  const cellSize = 60;
  const padding = 40;
  const svgSize = gridSize * cellSize + padding * 2;

  // Animate cells from center outward
  useEffect(() => {
    if (!isAnimating) return;

    const center = Math.floor(gridSize / 2);
    const maxDistance = Math.ceil(Math.sqrt(2) * center);

    const animateCells = async () => {
      for (let d = 0; d <= maxDistance; d++) {
        const newCells = new Set<string>();

        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            const distance = Math.sqrt(Math.pow(row - center, 2) + Math.pow(col - center, 2));
            if (Math.floor(distance) <= d) {
              newCells.add(`${row}-${col}`);
            }
          }
        }

        setAnimatedCells(newCells);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setIsAnimating(false);
    };

    animateCells();
  }, [gridSize, isAnimating]);

  // Export to PNG
  const exportToPNG = useCallback(async () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = svgSize * 2; // 2x for higher resolution
    canvas.height = svgSize * 2;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');

        if (onExportPNG) {
          onExportPNG(dataUrl);
        } else {
          // Download directly
          const link = document.createElement('a');
          link.download = `geogrid-${data.keyword.replace(/\s+/g, '-')}.png`;
          link.href = dataUrl;
          link.click();
        }
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [data.keyword, onExportPNG, svgSize]);

  const handleCellClick = (row: number, col: number) => {
    if (showBlurred) return;
    const point = data.points[row]?.[col];
    if (point) {
      setSelectedPoint(point);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF6B5B]" />
              Local Search Visibility Grid
            </CardTitle>
            <CardDescription>
              "{data.keyword}" - {data.radius} mile radius
            </CardDescription>
          </div>
          {!showBlurred && (
            <Button variant="outline" size="sm" onClick={exportToPNG}>
              <Download className="w-4 h-4 mr-2" />
              Export PNG
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-[#FF6B5B]">
              {data.visibility.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Top 3 Visibility</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-[#2DD4BF]">
              {data.averageRank > 0 ? data.averageRank.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg. Rank</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {gridSize}x{gridSize}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Grid Size</div>
          </div>
        </div>

        {/* SVG Grid */}
        <div className={`flex justify-center ${showBlurred ? 'blur-sm select-none pointer-events-none' : ''}`}>
          <svg
            ref={svgRef}
            width={svgSize}
            height={svgSize}
            className="rounded-lg"
            style={{ backgroundColor: '#f9fafb' }}
          >
            {/* Grid cells */}
            {data.points.map((row, rowIdx) =>
              row.map((point, colIdx) => {
                const x = padding + colIdx * cellSize;
                const y = padding + rowIdx * cellSize;
                const isCenter = rowIdx === Math.floor(gridSize / 2) && colIdx === Math.floor(gridSize / 2);
                const isAnimated = animatedCells.has(`${rowIdx}-${colIdx}`);

                return (
                  <g
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    style={{ cursor: showBlurred ? 'default' : 'pointer' }}
                  >
                    {/* Cell background */}
                    <rect
                      x={x + 2}
                      y={y + 2}
                      width={cellSize - 4}
                      height={cellSize - 4}
                      rx={8}
                      fill={isAnimated ? getRankColor(point.rank) : '#e5e7eb'}
                      opacity={isAnimated ? 1 : 0.3}
                      className="transition-all duration-300"
                    />

                    {/* Rank text */}
                    {isAnimated && (
                      <text
                        x={x + cellSize / 2}
                        y={y + cellSize / 2 + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        className="transition-opacity duration-300"
                      >
                        {getRankLabel(point.rank)}
                      </text>
                    )}

                    {/* Center marker */}
                    {isCenter && (
                      <circle
                        cx={x + cellSize / 2}
                        cy={y + cellSize / 2 - 15}
                        r={6}
                        fill="#FF6B5B"
                        stroke="white"
                        strokeWidth={2}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Legend */}
            <g transform={`translate(${padding}, ${svgSize - 25})`}>
              <rect x={0} y={0} width={16} height={16} rx={4} fill="#22C55E" />
              <text x={20} y={12} fontSize="10" fill="#666">1-3</text>

              <rect x={55} y={0} width={16} height={16} rx={4} fill="#EAB308" />
              <text x={75} y={12} fontSize="10" fill="#666">4-10</text>

              <rect x={115} y={0} width={16} height={16} rx={4} fill="#EF4444" />
              <text x={135} y={12} fontSize="10" fill="#666">11-20</text>

              <rect x={175} y={0} width={16} height={16} rx={4} fill="#9CA3AF" />
              <text x={195} y={12} fontSize="10" fill="#666">Not Found</text>
            </g>
          </svg>
        </div>

        {/* Blurred overlay message */}
        {showBlurred && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-gray-900/90 px-6 py-4 rounded-xl shadow-lg text-center">
              <p className="font-semibold text-lg">Full Grid Available in Complete Report</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Check your email for the detailed analysis</p>
            </div>
          </div>
        )}

        {/* Click instruction */}
        {!showBlurred && (
          <p className="text-center text-xs text-gray-500 mt-4">
            Click any cell to see detailed ranking info and competitors
          </p>
        )}
      </CardContent>

      {/* Detail Modal */}
      {selectedPoint && (
        <CellDetailModal
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
          businessName={data.businessName}
        />
      )}
    </Card>
  );
}

// Helper function to generate mock GeoGrid data for testing
export function generateMockGeoGridData(
  businessName: string,
  keyword: string,
  centerLat: number,
  centerLng: number,
  gridSize: 5 | 7 = 5,
  radius: number = 3
): GeoGridData {
  const points: GeoGridPoint[][] = [];
  const center = Math.floor(gridSize / 2);

  // Calculate degree offset for the radius (rough approximation)
  const degreeOffset = radius / 69; // ~69 miles per degree of latitude
  const stepSize = (degreeOffset * 2) / (gridSize - 1);

  let totalRank = 0;
  let rankedCount = 0;
  let top3Count = 0;

  for (let row = 0; row < gridSize; row++) {
    const rowPoints: GeoGridPoint[] = [];

    for (let col = 0; col < gridSize; col++) {
      const lat = centerLat + (center - row) * stepSize;
      const lng = centerLng + (col - center) * stepSize;

      // Calculate distance from center
      const distMiles = Math.sqrt(
        Math.pow((row - center) * (radius * 2 / (gridSize - 1)), 2) +
        Math.pow((col - center) * (radius * 2 / (gridSize - 1)), 2)
      );

      // Generate realistic mock rank (better near center, worse at edges)
      const distanceFactor = distMiles / radius;
      const baseRank = Math.floor(Math.random() * 5) + 1;
      const adjustedRank = Math.min(20, Math.max(1, Math.floor(baseRank + distanceFactor * 8 + Math.random() * 5)));

      // Some cells might not have ranking
      const rank = Math.random() > 0.1 ? adjustedRank : null;

      if (rank !== null) {
        totalRank += rank;
        rankedCount++;
        if (rank <= 3) top3Count++;
      }

      // Generate mock competitors
      const competitors = [
        { name: 'ABC Services', rank: Math.floor(Math.random() * 3) + 1 },
        { name: 'XYZ Company', rank: Math.floor(Math.random() * 5) + 2 },
        { name: 'Local Pro', rank: Math.floor(Math.random() * 8) + 3 },
      ].sort((a, b) => a.rank - b.rank);

      rowPoints.push({
        lat,
        lng,
        rank,
        competitors,
        distance: `${distMiles.toFixed(1)} mi`,
      });
    }

    points.push(rowPoints);
  }

  const totalCells = gridSize * gridSize;

  return {
    businessName,
    keyword,
    centerLat,
    centerLng,
    gridSize,
    radius,
    points,
    averageRank: rankedCount > 0 ? totalRank / rankedCount : 0,
    visibility: (top3Count / totalCells) * 100,
  };
}

export default GeoGridHeatmap;
