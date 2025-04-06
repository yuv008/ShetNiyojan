import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import LanguageSelector from "@/components/common/LanguageSelector";
import logoImage from "@/assets/logo.png";

const Register = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);
      await register(name, mobile, password);
      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.mobileno) {
        toast.error(error.response.data.mobileno[0]);
      } else if (error.response?.data?.fullname) {
        toast.error(error.response.data.fullname[0]);
      } else if (error.response?.data?.password) {
        toast.error(error.response.data.password[0]);
      } else {
        toast.error("Registration failed. Please try again later.");
      }
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-agrigreen-light/10 to-agriorange/10">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoImage} 
              alt="ShetNiyojan Logo" 
              className="w-10 h-10 mr-2"
            />
            <h1 className="text-3xl font-bold text-agrigreen">ShetNiyojan</h1>
          </div>
          <p className="text-muted-foreground">Create your account</p>
        </div>
        
        <Card className="w-full shadow-lg border-agriBg">
          <CardHeader>
            <CardTitle className="text-2xl">Join ShetNiyojan</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="mobile">
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  pattern="[0-9]{10}"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full bg-agrigreen hover:bg-agrigreen-dark text-white" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-agrigreen hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      {/* Floating language selector */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white p-2 rounded-lg shadow-lg">
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};

export default Register;
