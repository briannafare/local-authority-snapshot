import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, Mail, Phone, User, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface LeadCaptureFormProps {
  businessName: string;
  onSubmit: (data: { name: string; email: string; phone: string }) => Promise<void>;
  isLoading?: boolean;
}

export function LeadCaptureForm({ businessName, onSubmit, isLoading = false }: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    await onSubmit({ name, email, phone });
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF6B5B]/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#FF6B5B]" />
        </div>
        <CardTitle className="text-2xl">Unlock Your Full Report</CardTitle>
        <CardDescription className="text-base">
          Enter your details to access the complete Local Authority Snapshot for <strong>{businessName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className={errors.phone ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#FF6B5B] hover:bg-[#E55A4A] text-white py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Unlocking Report...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Get My Full Report
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-center text-gray-500">
            Your report will be emailed to you immediately. We respect your privacy and will never share your information.
          </p>
        </div>
        
        <div className="mt-4 bg-[#2DD4BF]/10 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#2DD4BF]" />
            What you'll get:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Complete GeoGrid visibility heatmap</li>
            <li>• Full competitor analysis & benchmarks</li>
            <li>• Detailed action plan with priorities</li>
            <li>• PDF report delivered to your inbox</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default LeadCaptureForm;
