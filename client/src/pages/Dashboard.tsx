import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Search,
  Download,
  Eye,
  Mail,
  RefreshCw,
  Lock,
  Unlock,
  BarChart3,
  Users,
  FileText,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Simple password protection for MVP
const DASHBOARD_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || "eighty5labs2024";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAudit, setSelectedAudit] = useState<number | null>(null);

  // Check for saved auth in session storage
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("dashboardAuth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all audits for the dashboard
  const { data: audits, isLoading, refetch } = trpc.audits.listAll.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const generatePDFMutation = trpc.audits.generatePDF.useMutation({
    onSuccess: (data) => {
      window.open(data.pdfUrl, "_blank");
      toast.success("PDF generated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to generate PDF: ${error.message}`);
    },
  });

  const sendEmailMutation = trpc.audits.sendEmail.useMutation({
    onSuccess: () => {
      toast.success("Email sent successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to send email: ${error.message}`);
    },
  });

  const handleLogin = () => {
    if (passwordInput === DASHBOARD_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("dashboardAuth", "true");
      toast.success("Welcome to the Sales Dashboard!");
    } else {
      toast.error("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("dashboardAuth");
  };

  // Filter audits based on search
  const filteredAudits = audits?.filter((audit) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      audit.businessName.toLowerCase().includes(query) ||
      audit.primaryLocation.toLowerCase().includes(query) ||
      audit.primaryNiche.toLowerCase().includes(query)
    );
  });

  // Calculate stats
  const stats = {
    total: audits?.length || 0,
    completed: audits?.filter((a) => a.status === "completed").length || 0,
    thisWeek: audits?.filter((a) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.createdAt) > weekAgo;
    }).length || 0,
    withEmail: audits?.filter((a) => a.emailSent).length || 0,
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/10 via-white to-[#2DD4BF]/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF6B5B] to-[#2DD4BF] flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Sales Dashboard</CardTitle>
            <CardDescription>
              Enter the dashboard password to access lead management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <Button
                className="w-full bg-[#FF6B5B] hover:bg-[#E55A4A]"
                onClick={handleLogin}
              >
                <Unlock className="w-4 h-4 mr-2" />
                Access Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B5B] to-[#2DD4BF] flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sales Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  eighty5labs Lead Management
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Leads"
            value={stats.total}
            icon={Users}
            color="text-[#FF6B5B]"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={FileText}
            color="text-green-500"
          />
          <StatCard
            title="This Week"
            value={stats.thisWeek}
            icon={Calendar}
            color="text-[#2DD4BF]"
          />
          <StatCard
            title="Emails Sent"
            value={stats.withEmail}
            icon={Mail}
            color="text-blue-500"
          />
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by business name, location, or niche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation("/audit")}
              >
                + New Audit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audits Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>
              {filteredAudits?.length || 0} audits found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B5B]" />
              </div>
            ) : filteredAudits && filteredAudits.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{audit.businessName}</div>
                          <div className="text-xs text-gray-500">{audit.primaryNiche}</div>
                        </div>
                      </TableCell>
                      <TableCell>{audit.primaryLocation}</TableCell>
                      <TableCell>
                        {audit.overallGrade ? (
                          <GradeBadge grade={audit.overallGrade} />
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={audit.status} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(audit.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/report/${audit.id}?full=true`)}
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info("Generating PDF...");
                              generatePDFMutation.mutate({ auditId: audit.id });
                            }}
                            disabled={audit.status !== "completed" || generatePDFMutation.isPending}
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAudit(audit.id)}
                            disabled={audit.status !== "completed"}
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          {audit.websiteUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(audit.websiteUrl, "_blank")}
                              title="Visit Website"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No audits found</p>
                <p className="text-sm">Create a new audit to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Dialog */}
      <EmailDialog
        auditId={selectedAudit}
        onClose={() => setSelectedAudit(null)}
        onSend={(email) => {
          if (selectedAudit) {
            sendEmailMutation.mutate({ auditId: selectedAudit, email });
            setSelectedAudit(null);
          }
        }}
        isPending={sendEmailMutation.isPending}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`w-10 h-10 ${color} opacity-30`} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-gray-100 text-gray-800", label: "Pending" },
    processing: { color: "bg-blue-100 text-blue-800", label: "Processing" },
    completed: { color: "bg-green-100 text-green-800", label: "Completed" },
    failed: { color: "bg-red-100 text-red-800", label: "Failed" },
  };
  const { color, label } = config[status] || config.pending;
  return <Badge className={color}>{label}</Badge>;
}

function GradeBadge({ grade }: { grade: string }) {
  const config: Record<string, string> = {
    A: "bg-green-100 text-green-800 border-green-300",
    B: "bg-blue-100 text-blue-800 border-blue-300",
    C: "bg-yellow-100 text-yellow-800 border-yellow-300",
    D: "bg-orange-100 text-orange-800 border-orange-300",
    F: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <Badge variant="outline" className={`${config[grade]} font-bold`}>
      {grade}
    </Badge>
  );
}

function EmailDialog({
  auditId,
  onClose,
  onSend,
  isPending,
}: {
  auditId: number | null;
  onClose: () => void;
  onSend: (email: string) => void;
  isPending: boolean;
}) {
  const [email, setEmail] = useState("");

  return (
    <Dialog open={auditId !== null} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Report</DialogTitle>
          <DialogDescription>
            Enter the email address to send the full audit report.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                onSend(email);
                setEmail("");
              } else {
                toast.error("Please enter a valid email address");
              }
            }}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
