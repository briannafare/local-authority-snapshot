import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

// Form validation schemas
const step1Schema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  websiteUrl: z.string().url("Please enter a valid website URL"),
  gbpUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  primaryLocation: z.string().min(2, "Location is required"),
  primaryNiche: z.string().min(1, "Please select a niche"),
  nicheDescription: z.string().optional(),
});

const step2Schema = z.object({
  leadSources: z.array(z.string()).min(1, "Select at least one lead source"),
  runsPaidAds: z.string().min(1, "Please select an option"),
  hasLocalListing: z.string().min(1, "Please select an option"),
  activeOnSocial: z.string().min(1, "Please select an option"),
  usesAutomation: z.string().min(1, "Please select an option"),
  hasCallCoverage: z.string().min(1, "Please select an option"),
  monthlyVisitors: z.number().int().min(0).optional(),
  monthlyLeads: z.number().int().min(0).optional(),
  avgRevenuePerClient: z.number().int().min(0).optional(),
});

const step3Schema = z.object({
  businessGoals: z.array(z.string()).min(1, "Select at least one goal"),
  painPoints: z.array(z.string()).min(1, "Select at least one pain point"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const NICHE_OPTIONS = [
  { value: "real-estate", label: "Real Estate Agent" },
  { value: "mortgage", label: "Mortgage Lender" },
  { value: "hvac", label: "HVAC" },
  { value: "plumbing", label: "Plumbing" },
  { value: "roofing", label: "Roofing" },
  { value: "electrician", label: "Electrician" },
  { value: "home-services", label: "Home Services (Other)" },
  { value: "med-spa", label: "Med Spa / Aesthetics" },
  { value: "professional-services", label: "Professional Services" },
  { value: "restaurant", label: "Restaurant / Local Retail" },
  { value: "other", label: "Other" },
];

const LEAD_SOURCE_OPTIONS = [
  "Referrals",
  "Google Search",
  "Social Media",
  "Paid Ads",
  "Walk-ins",
  "Email Marketing",
  "Other",
];

const BUSINESS_GOALS = [
  "More appointments",
  "More high-ticket jobs",
  "More predictable pipeline",
  "Increase revenue",
  "Expand service area",
  "Build brand awareness",
];

const PAIN_POINTS = [
  "Missed calls",
  "No-shows",
  "Ghosted leads",
  "Inconsistent lead flow",
  "Overwhelmed team",
  "Low conversion rate",
  "Poor online visibility",
];

export default function AuditForm() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data>>({});
  
  const createAuditMutation = trpc.audits.create.useMutation({
    onSuccess: (data) => {
      toast.success("Audit created successfully! Generating your report...");
      setLocation(`/report/${data.auditId}`);
    },
    onError: (error) => {
      toast.error(`Failed to create audit: ${error.message}`);
    },
  });

  const progress = (currentStep / 3) * 100;

  const handleNext = (data: any) => {
    setFormData({ ...formData, ...data });
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: any) => {
    const finalData = { ...formData, ...data };
    createAuditMutation.mutate(finalData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B5B]/5 via-white to-[#2DD4BF]/5">
      <div className="container py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Local Authority Snapshot</h1>
          <p className="text-lg text-gray-600">
            Discover hidden revenue opportunities in your local business
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step < currentStep
                    ? "bg-[#2DD4BF] text-white"
                    : step === currentStep
                    ? "bg-[#FF6B5B] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">
                {step === 1 && "Business Basics"}
                {step === 2 && "Current Marketing"}
                {step === 3 && "Goals & Pain Points"}
              </span>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Tell us about your business"}
              {currentStep === 2 && "Current marketing & operations"}
              {currentStep === 3 && "Goals & challenges"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Basic information to personalize your audit"}
              {currentStep === 2 && "Help us understand your current setup"}
              {currentStep === 3 && "What you want to achieve and overcome"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <Step1Form onNext={handleNext} defaultValues={formData} />}
            {currentStep === 2 && <Step2Form onNext={handleNext} onBack={handleBack} defaultValues={formData} />}
            {currentStep === 3 && (
              <Step3Form
                onSubmit={handleSubmit}
                onBack={handleBack}
                defaultValues={formData}
                isSubmitting={createAuditMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Step 1: Business Basics
function Step1Form({ onNext, defaultValues }: { onNext: (data: Step1Data) => void; defaultValues: any }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  const primaryNiche = watch("primaryNiche");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <Label htmlFor="businessName">Business Name *</Label>
        <Input id="businessName" {...register("businessName")} placeholder="e.g., Smith & Sons HVAC" />
        {errors.businessName && <p className="text-sm text-red-500 mt-1">{errors.businessName.message}</p>}
      </div>

      <div>
        <Label htmlFor="websiteUrl">Website URL *</Label>
        <Input id="websiteUrl" {...register("websiteUrl")} placeholder="https://example.com" />
        {errors.websiteUrl && <p className="text-sm text-red-500 mt-1">{errors.websiteUrl.message}</p>}
      </div>

      <div>
        <Label htmlFor="gbpUrl">Google Business Profile URL (Optional)</Label>
        <Input
          id="gbpUrl"
          {...register("gbpUrl")}
          placeholder="https://maps.google.com/?cid=... or https://g.page/..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Paste your Google Business Profile link for accurate GBP data
        </p>
        {errors.gbpUrl && <p className="text-sm text-red-500 mt-1">{errors.gbpUrl.message}</p>}
      </div>

      <div>
        <Label htmlFor="primaryLocation">Primary Location (City, State) *</Label>
        <Input id="primaryLocation" {...register("primaryLocation")} placeholder="e.g., Portland, OR" />
        {errors.primaryLocation && <p className="text-sm text-red-500 mt-1">{errors.primaryLocation.message}</p>}
      </div>

      <div>
        <Label htmlFor="primaryNiche">Primary Niche *</Label>
        <Select onValueChange={(value) => setValue("primaryNiche", value)} defaultValue={defaultValues?.primaryNiche}>
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {NICHE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.primaryNiche && <p className="text-sm text-red-500 mt-1">{errors.primaryNiche.message}</p>}
      </div>

      {primaryNiche === "other" && (
        <div>
          <Label htmlFor="nicheDescription">Please describe your business</Label>
          <Textarea id="nicheDescription" {...register("nicheDescription")} placeholder="Tell us what you do" />
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="bg-[#FF6B5B] hover:bg-[#E55A4A]">
          Next Step <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

// Step 2: Current Marketing
function Step2Form({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: Step2Data) => void;
  onBack: () => void;
  defaultValues: any;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      ...defaultValues,
      leadSources: defaultValues?.leadSources || [],
    },
  });

  const leadSources = watch("leadSources") || [];

  const toggleLeadSource = (source: string) => {
    const current = leadSources || [];
    if (current.includes(source)) {
      setValue(
        "leadSources",
        current.filter((s) => s !== source),
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      setValue("leadSources", [...current, source], { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => {
      console.log('Step 2 form data:', data);
      onNext(data);
    }, (errors) => {
      console.log('Step 2 form validation errors:', errors);
    })} className="space-y-6">
      <div>
        <Label>Main ways you currently get clients *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {LEAD_SOURCE_OPTIONS.map((source) => (
            <Button
              key={source}
              type="button"
              variant={leadSources.includes(source) ? "default" : "outline"}
              onClick={() => toggleLeadSource(source)}
              className={leadSources.includes(source) ? "bg-[#2DD4BF] hover:bg-[#14B8A6]" : ""}
            >
              {source}
            </Button>
          ))}
        </div>
        {errors.leadSources && <p className="text-sm text-red-500 mt-1">{errors.leadSources.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Run paid ads? *</Label>
          <Select onValueChange={(value) => setValue("runsPaidAds", value)} defaultValue={defaultValues?.runsPaidAds}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="unsure">Unsure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Have a local business listing? *</Label>
          <Select
            onValueChange={(value) => setValue("hasLocalListing", value)}
            defaultValue={defaultValues?.hasLocalListing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="unsure">Unsure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Actively post on social media? *</Label>
          <Select
            onValueChange={(value) => setValue("activeOnSocial", value)}
            defaultValue={defaultValues?.activeOnSocial}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Use automation for follow-up? *</Label>
          <Select
            onValueChange={(value) => setValue("usesAutomation", value)}
            defaultValue={defaultValues?.usesAutomation}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="unsure">Unsure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Consistent call/lead answering? *</Label>
          <Select
            onValueChange={(value) => setValue("hasCallCoverage", value)}
            defaultValue={defaultValues?.hasCallCoverage}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="inconsistent">Inconsistent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-4">Optional: Help us estimate your revenue opportunity</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="monthlyVisitors">Monthly website visitors</Label>
            <Input
              id="monthlyVisitors"
              type="number"
              {...register("monthlyVisitors", { valueAsNumber: true })}
              placeholder="e.g., 500"
            />
          </div>

          <div>
            <Label htmlFor="monthlyLeads">Monthly inbound leads/calls</Label>
            <Input
              id="monthlyLeads"
              type="number"
              {...register("monthlyLeads", { valueAsNumber: true })}
              placeholder="e.g., 50"
            />
          </div>

          <div>
            <Label htmlFor="avgRevenuePerClient">Avg revenue per client ($)</Label>
            <Input
              id="avgRevenuePerClient"
              type="number"
              {...register("avgRevenuePerClient", { valueAsNumber: true })}
              placeholder="e.g., 5000"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button type="submit" className="bg-[#FF6B5B] hover:bg-[#E55A4A]">
          Next Step <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

// Step 3: Goals & Pain Points
function Step3Form({
  onSubmit,
  onBack,
  defaultValues,
  isSubmitting,
}: {
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
  defaultValues: any;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      ...defaultValues,
      businessGoals: defaultValues?.businessGoals || [],
      painPoints: defaultValues?.painPoints || [],
    },
  });

  const businessGoals = watch("businessGoals") || [];
  const painPoints = watch("painPoints") || [];

  const toggleGoal = (goal: string) => {
    const current = businessGoals || [];
    if (current.includes(goal)) {
      setValue(
        "businessGoals",
        current.filter((g) => g !== goal),
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      setValue("businessGoals", [...current, goal], { shouldValidate: true, shouldDirty: true });
    }
  };

  const togglePainPoint = (point: string) => {
    const current = painPoints || [];
    if (current.includes(point)) {
      setValue(
        "painPoints",
        current.filter((p) => p !== point),
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      setValue("painPoints", [...current, point], { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label>Top business goals (select 2-3) *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {BUSINESS_GOALS.map((goal) => (
            <Button
              key={goal}
              type="button"
              variant={businessGoals.includes(goal) ? "default" : "outline"}
              onClick={() => toggleGoal(goal)}
              className={businessGoals.includes(goal) ? "bg-[#2DD4BF] hover:bg-[#14B8A6]" : ""}
            >
              {goal}
            </Button>
          ))}
        </div>
        {errors.businessGoals && <p className="text-sm text-red-500 mt-1">{errors.businessGoals.message}</p>}
      </div>

      <div>
        <Label>Top pain points (select 2-3) *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {PAIN_POINTS.map((point) => (
            <Button
              key={point}
              type="button"
              variant={painPoints.includes(point) ? "default" : "outline"}
              onClick={() => togglePainPoint(point)}
              className={painPoints.includes(point) ? "bg-[#FF6B5B] hover:bg-[#E55A4A]" : ""}
            >
              {point}
            </Button>
          ))}
        </div>
        {errors.painPoints && <p className="text-sm text-red-500 mt-1">{errors.painPoints.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email address (optional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register("email")}
        />
        <p className="text-xs text-gray-500 mt-1">
          Receive your audit report via email when it's ready
        </p>
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div className="bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-lg p-4">
        <p className="text-sm text-gray-900">
          <strong>What happens next?</strong> We'll analyze your business across 6 dimensions (SEO, AEO, competitive
          visibility, lead capture, conversion, and follow-up) and generate a comprehensive revenue recapture report
          with specific, actionable recommendations.
        </p>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button type="submit" className="bg-[#FF6B5B] hover:bg-[#E55A4A]" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Generating Report...
            </>
          ) : (
            <>
              Generate My Audit <CheckCircle2 className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
