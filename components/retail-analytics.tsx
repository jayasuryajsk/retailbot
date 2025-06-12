import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, DollarSign, Users } from 'lucide-react';

interface ProductPerformance {
  product: string;
  category: string;
  revenue: number;
  quantity: number;
  avgPrice: number;
  profit: number;
  profitMargin: number;
}

interface ProductAnalyticsData {
  topProducts: ProductPerformance[];
  categoryPerformance: Array<{
    category: string;
    revenue: number;
    quantity: number;
  }>;
  summary: {
    totalProducts: number;
    totalRevenue: number;
    bestSeller: string;
    highestMargin: ProductPerformance;
  };
  metadata?: {
    sortBy: string;
    sortOrder: string;
    isLowestFirst: boolean;
  };
}

interface RetailAnalyticsProps {
  data: ProductAnalyticsData;
  type: 'products' | 'sales' | 'inventory' | 'customers' | 'stores';
}

export function RetailAnalytics({ data, type }: RetailAnalyticsProps) {
  if (type === 'products') {
    return <ProductAnalyticsCard data={data} />;
  }
  
  return null; // TODO: Add other types
}

function ProductAnalyticsCard({ data }: { data: ProductAnalyticsData }) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Product Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${data.summary.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.summary.totalProducts}
            </div>
            <div className="text-sm text-gray-500">Products</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-purple-600">
              {data.summary.bestSeller}
            </div>
            <div className="text-sm text-gray-500">
              {data.metadata?.isLowestFirst ? 
                (data.metadata.sortBy === 'quantity' ? 'Least Sold' : 
                 data.metadata.sortBy === 'revenue' ? 'Lowest Revenue' : 'Lowest Performer') : 
                'Best Seller'
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-orange-600">
              {data.summary.highestMargin?.profitMargin ? 
                `${Number(data.summary.highestMargin.profitMargin).toFixed(1)}%` : '0%'
              }
            </div>
            <div className="text-sm text-gray-500">Highest Margin</div>
          </div>
        </div>

        {/* Top Products */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Package className="size-4" />
            {data.metadata?.isLowestFirst ? 
              `Lowest Performing Products (by ${data.metadata.sortBy})` : 
              `Top Performing Products (by ${data.metadata?.sortBy || 'revenue'})`
            }
          </h3>
          <div className="space-y-3">
            {data.topProducts.slice(0, 5).map((product, index) => (
              <div
                key={product.product}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{product.product}</div>
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    ${product.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.quantity} units • {Number(product.profitMargin).toFixed(1)}% margin
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="size-4" />
            Category Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.categoryPerformance.map((category) => (
              <div
                key={category.category}
                className="p-3 border rounded-lg"
              >
                <div className="font-medium">{category.category}</div>
                <div className="text-sm text-gray-600">
                  ${category.revenue.toLocaleString()} • {category.quantity} units
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sample data for loading state
export const sampleProductAnalytics: ProductAnalyticsData = {
  topProducts: [
    {
      product: "Winter Jacket",
      category: "Clothing",
      revenue: 899.90,
      quantity: 10,
      avgPrice: 89.99,
      profit: 449.90,
      profitMargin: 50.0
    },
    {
      product: "Running Shoes",
      category: "Footwear", 
      revenue: 519.96,
      quantity: 4,
      avgPrice: 129.99,
      profit: 259.96,
      profitMargin: 50.0
    }
  ],
  categoryPerformance: [
    { category: "Clothing", revenue: 899.90, quantity: 10 },
    { category: "Footwear", revenue: 519.96, quantity: 4 }
  ],
  summary: {
    totalProducts: 7,
    totalRevenue: 2189.76,
    bestSeller: "Winter Jacket",
    highestMargin: {
      product: "Winter Jacket",
      category: "Clothing", 
      revenue: 899.90,
      quantity: 10,
      avgPrice: 89.99,
      profit: 449.90,
      profitMargin: 50.0
    }
  }
};