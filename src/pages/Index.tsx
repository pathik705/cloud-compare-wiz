import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cloud, TrendingUp, DollarSign, Server } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6">
            <Cloud className="w-16 h-16 text-primary-foreground" />
          </div>
          
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Cloud Comparison Dashboard
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare pricing, features, and offerings across AWS, Google Cloud, and Azure in real-time
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <DollarSign className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Real-Time Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Live pricing data from public APIs
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <Server className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Detailed Comparison</h3>
              <p className="text-sm text-muted-foreground">
                Compare compute, storage, and features
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <TrendingUp className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart Sorting</h3>
              <p className="text-sm text-muted-foreground">
                Sort by price, specs, or features
              </p>
            </div>
          </div>

          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
