import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CloudService {
  provider: string;
  service: string;
  region: string;
  pricePerHour: number;
  pricePerMonth: number;
  vcpu: number;
  ram: number;
  storage: number;
  features: string[];
}

type SortField = 'pricePerMonth' | 'vcpu' | 'ram' | 'storage';
type SortOrder = 'asc' | 'desc';

const ComparisonTable = () => {
  const [services, setServices] = useState<CloudService[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('pricePerMonth');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-cloud-pricing');
      
      if (error) throw error;
      
      if (data && Array.isArray(data.services)) {
        setServices(data.services);
      }
    } catch (error: any) {
      console.error('Error fetching pricing:', error);
      toast.error("Failed to fetch pricing data");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedServices = [...services].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return (aValue - bValue) * multiplier;
  });

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'aws':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'gcp':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'azure':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
            <p className="text-muted-foreground">Fetching real-time pricing...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Cloud Service Comparison</CardTitle>
        <CardDescription>
          Compare pricing, features, and offerings across AWS, GCP, and Azure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Provider</TableHead>
                <TableHead className="font-semibold">Service</TableHead>
                <TableHead className="font-semibold">Region</TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('pricePerMonth')}
                    className="h-8 px-2"
                  >
                    Price/Month
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('vcpu')}
                    className="h-8 px-2"
                  >
                    vCPU
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('ram')}
                    className="h-8 px-2"
                  >
                    RAM (GB)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('storage')}
                    className="h-8 px-2"
                  >
                    Storage (GB)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No pricing data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedServices.map((service, index) => (
                  <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Badge variant="outline" className={getProviderColor(service.provider)}>
                        {service.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{service.service}</TableCell>
                    <TableCell className="text-muted-foreground">{service.region}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      ${service.pricePerMonth.toFixed(2)}
                    </TableCell>
                    <TableCell>{service.vcpu}</TableCell>
                    <TableCell>{service.ram}</TableCell>
                    <TableCell>{service.storage}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {service.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{service.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;