import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching cloud pricing data...');
    
    const services: CloudService[] = [];

    // Fetch Azure pricing (public API, no auth needed)
    try {
      console.log('Fetching Azure pricing...');
      const azureResponse = await fetch(
        'https://prices.azure.com/api/retail/prices?$filter=serviceName eq \'Virtual Machines\' and priceType eq \'Consumption\' and armRegionName eq \'eastus\'&$top=10'
      );
      
      if (azureResponse.ok) {
        const azureData = await azureResponse.json();
        console.log(`Azure API returned ${azureData.Items?.length || 0} items`);
        
        if (azureData.Items && Array.isArray(azureData.Items)) {
          azureData.Items.forEach((item: any) => {
            if (item.unitPrice && item.unitPrice > 0) {
              // Extract vCPU and RAM from product name
              const vcpu = extractNumber(item.armSkuName, /(\d+)\s*vCPU/i) || 2;
              const ram = extractNumber(item.productName, /(\d+)\s*GB/i) || 8;
              
              services.push({
                provider: 'Azure',
                service: item.armSkuName || 'VM Instance',
                region: item.armRegionName || 'East US',
                pricePerHour: item.unitPrice || 0,
                pricePerMonth: (item.unitPrice || 0) * 730,
                vcpu: vcpu,
                ram: ram,
                storage: 128,
                features: [
                  item.productName?.includes('Premium') ? 'Premium SSD' : 'Standard SSD',
                  'Managed Disk',
                  'Virtual Network'
                ].filter(Boolean),
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Azure API error:', error);
    }

    // Add sample AWS data (requires AWS credentials for real-time)
    services.push(
      {
        provider: 'AWS',
        service: 't3.medium',
        region: 'us-east-1',
        pricePerHour: 0.0416,
        pricePerMonth: 30.37,
        vcpu: 2,
        ram: 4,
        storage: 100,
        features: ['EBS Optimized', 'VPC', 'Burstable Performance'],
      },
      {
        provider: 'AWS',
        service: 't3.large',
        region: 'us-east-1',
        pricePerHour: 0.0832,
        pricePerMonth: 60.74,
        vcpu: 2,
        ram: 8,
        storage: 100,
        features: ['EBS Optimized', 'VPC', 'Burstable Performance'],
      },
      {
        provider: 'AWS',
        service: 'm5.large',
        region: 'us-east-1',
        pricePerHour: 0.096,
        pricePerMonth: 70.08,
        vcpu: 2,
        ram: 8,
        storage: 150,
        features: ['EBS Optimized', 'VPC', 'Enhanced Networking'],
      }
    );

    // Add sample GCP data (requires GCP credentials for real-time)
    services.push(
      {
        provider: 'GCP',
        service: 'n1-standard-2',
        region: 'us-central1',
        pricePerHour: 0.095,
        pricePerMonth: 69.35,
        vcpu: 2,
        ram: 7.5,
        storage: 100,
        features: ['SSD Persistent Disk', 'VPC', 'Live Migration'],
      },
      {
        provider: 'GCP',
        service: 'n2-standard-2',
        region: 'us-central1',
        pricePerHour: 0.097,
        pricePerMonth: 70.81,
        vcpu: 2,
        ram: 8,
        storage: 100,
        features: ['SSD Persistent Disk', 'VPC', 'Live Migration'],
      },
      {
        provider: 'GCP',
        service: 'e2-medium',
        region: 'us-central1',
        pricePerHour: 0.033,
        pricePerMonth: 24.09,
        vcpu: 2,
        ram: 4,
        storage: 100,
        features: ['Standard Persistent Disk', 'VPC', 'Cost Optimized'],
      }
    );

    console.log(`Total services collected: ${services.length}`);

    return new Response(
      JSON.stringify({ 
        services,
        timestamp: new Date().toISOString(),
        note: 'Azure pricing is live. AWS and GCP data are samples. Add credentials for live pricing.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in fetch-cloud-pricing function:', error);
    return new Response(
      JSON.stringify({ error: error.message, services: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractNumber(text: string, pattern: RegExp): number | null {
  const match = text?.match(pattern);
  return match ? parseInt(match[1]) : null;
}