import { tool } from 'ai';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load retail data
async function loadRetailData() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'sales_data.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading retail data:', error);
    return null;
  }
}

export const getSalesData = tool({
  description: 'Get sales data with optional filters by date range, store, product, or category. If no dates provided, returns all available data.',
  parameters: z.object({
    startDate: z.string().optional().describe('Start date (YYYY-MM-DD) - optional'),
    endDate: z.string().optional().describe('End date (YYYY-MM-DD) - optional'),
    store: z.string().optional().describe('Store name'),
    product: z.string().optional().describe('Product name'),
    category: z.string().optional().describe('Product category'),
  }),
  execute: async ({ startDate, endDate, store, product, category }) => {
    const data = await loadRetailData();
    if (!data) return { error: 'Failed to load data' };

    let sales = data.sales;

    // Apply filters
    if (startDate) {
      sales = sales.filter((s: any) => s.date >= startDate);
    }
    if (endDate) {
      sales = sales.filter((s: any) => s.date <= endDate);
    }
    if (store) {
      sales = sales.filter((s: any) => s.store.toLowerCase().includes(store.toLowerCase()));
    }
    if (product) {
      sales = sales.filter((s: any) => s.product.toLowerCase().includes(product.toLowerCase()));
    }
    if (category) {
      sales = sales.filter((s: any) => s.category.toLowerCase().includes(category.toLowerCase()));
    }

    // Calculate summary for AI to interpret
    const totalRevenue = sales.reduce((sum: number, s: any) => sum + s.total, 0);
    const totalQuantity = sales.reduce((sum: number, s: any) => sum + s.quantity, 0);
    const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

    return {
      sales,
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalQuantity,
        numberOfTransactions: sales.length,
        averageOrderValue: averageOrderValue.toFixed(2),
      },
    };
  },
});

export const getInventoryStatus = tool({
  description: 'Get current inventory status and identify low stock items',
  parameters: z.object({
    category: z.string().optional().describe('Filter by product category'),
    lowStockOnly: z.boolean().default(false).describe('Show only low stock items'),
  }),
  execute: async ({ category, lowStockOnly }) => {
    const data = await loadRetailData();
    if (!data) return { error: 'Failed to load data' };

    let inventory = data.inventory;

    // Apply filters
    if (category) {
      inventory = inventory.filter((i: any) => 
        i.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (lowStockOnly) {
      inventory = inventory.filter((i: any) => i.current_stock <= i.reorder_point);
    }

    // Calculate inventory value
    const totalValue = inventory.reduce((sum: number, i: any) => 
      sum + (i.current_stock * i.cost), 0
    );

    const lowStockItems = data.inventory.filter((i: any) => 
      i.current_stock <= i.reorder_point
    );

    return `Inventory Status Report:

📦 CURRENT INVENTORY (${inventory.length} products):
${inventory.map(i => 
  `• ${i.product} (${i.category}): ${i.current_stock} units in stock
    Reorder point: ${i.reorder_point} | Cost: $${i.cost} each | Value: $${(i.current_stock * i.cost).toFixed(2)}`
).join('\n')}

⚠️ LOW STOCK ALERTS (${lowStockItems.length} items):
${lowStockItems.length > 0 ? 
  lowStockItems.map(i => `• ${i.product}: ${i.current_stock} units (reorder at ${i.reorder_point})`).join('\n')
  : '• No items currently low in stock'}

💰 INVENTORY SUMMARY:
- Total Products: ${inventory.length}
- Total Inventory Value: $${totalValue.toFixed(2)}
- Items Needing Restock: ${lowStockItems.length}`;
  },
});

export const getCustomerAnalytics = tool({
  description: 'Get customer analytics including top customers and loyalty distribution',
  parameters: z.object({
    loyaltyTier: z.string().optional().describe('Filter by loyalty tier (Gold, Silver, Bronze)'),
    minPurchases: z.number().optional().describe('Minimum total purchase amount'),
  }),
  execute: async ({ loyaltyTier, minPurchases }) => {
    const data = await loadRetailData();
    if (!data) return { error: 'Failed to load data' };

    let customers = data.customers;

    // Apply filters
    if (loyaltyTier) {
      customers = customers.filter((c: any) => 
        c.loyalty_tier.toLowerCase() === loyaltyTier.toLowerCase()
      );
    }
    if (minPurchases) {
      customers = customers.filter((c: any) => c.total_purchases >= minPurchases);
    }

    // Calculate loyalty distribution
    const loyaltyDistribution = data.customers.reduce((acc: any, c: any) => {
      acc[c.loyalty_tier] = (acc[c.loyalty_tier] || 0) + 1;
      return acc;
    }, {});

    // Top customers
    const topCustomers = [...data.customers]
      .sort((a: any, b: any) => b.total_purchases - a.total_purchases)
      .slice(0, 5);

    const totalRevenue = customers.reduce((sum: number, c: any) => 
      sum + c.total_purchases, 0
    );

    return {
      customers,
      analytics: {
        totalCustomers: customers.length,
        totalRevenue: totalRevenue.toFixed(2),
        averageCustomerValue: (totalRevenue / customers.length).toFixed(2),
        loyaltyDistribution,
        topCustomers: topCustomers.map((c: any) => ({
          name: c.name,
          totalPurchases: c.total_purchases,
          tier: c.loyalty_tier,
        })),
      },
    };
  },
});

export const getStorePerformance = tool({
  description: 'Get store performance metrics and compare against targets',
  parameters: z.object({
    storeName: z.string().optional().describe('Specific store name'),
    dateRange: z.object({
      start: z.string().describe('Start date (YYYY-MM-DD)'),
      end: z.string().describe('End date (YYYY-MM-DD)'),
    }).optional(),
  }),
  execute: async ({ storeName, dateRange }) => {
    const data = await loadRetailData();
    if (!data) return { error: 'Failed to load data' };

    let stores = data.stores;
    if (storeName) {
      stores = stores.filter((s: any) => 
        s.name.toLowerCase().includes(storeName.toLowerCase())
      );
    }

    // Calculate performance for each store
    const storePerformance = stores.map((store: any) => {
      let storeSales = data.sales.filter((s: any) => s.store === store.name);
      
      if (dateRange) {
        storeSales = storeSales.filter((s: any) => 
          s.date >= dateRange.start && s.date <= dateRange.end
        );
      }

      const revenue = storeSales.reduce((sum: number, s: any) => sum + s.total, 0);
      const transactions = storeSales.length;
      const avgTransaction = transactions > 0 ? revenue / transactions : 0;

      // Product performance for this store
      const productSales = storeSales.reduce((acc: any, s: any) => {
        if (!acc[s.product]) {
          acc[s.product] = { quantity: 0, revenue: 0 };
        }
        acc[s.product].quantity += s.quantity;
        acc[s.product].revenue += s.total;
        return acc;
      }, {});

      const topProducts = Object.entries(productSales)
        .map(([product, data]: [string, any]) => ({
          product,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

      return {
        store: store.name,
        manager: store.manager,
        monthlyTarget: store.monthly_target,
        performance: {
          revenue: revenue.toFixed(2),
          transactions,
          avgTransaction: avgTransaction.toFixed(2),
          targetAchievement: ((revenue / store.monthly_target) * 100).toFixed(1) + '%',
        },
        topProducts,
      };
    });

    return {
      storePerformance,
      summary: {
        totalRevenue: storePerformance.reduce((sum: number, s: any) => 
          sum + parseFloat(s.performance.revenue), 0
        ).toFixed(2),
        bestPerformer: storePerformance.sort((a: any, b: any) => 
          parseFloat(b.performance.revenue) - parseFloat(a.performance.revenue)
        )[0]?.store,
      },
    };
  },
});

export const getProductAnalytics = tool({
  description: 'Analyze product performance including best/worst sellers, profit margins, and various sorting options',
  parameters: z.object({
    category: z.string().optional().describe('Filter by category'),
    topN: z.number().default(5).describe('Number of products to return'),
    sortBy: z.enum(['revenue', 'quantity', 'profit', 'profitMargin']).default('revenue').describe('Sort products by: revenue, quantity, profit, or profitMargin'),
    sortOrder: z.enum(['asc', 'desc']).default('desc').describe('Sort order: desc for highest first, asc for lowest first'),
  }),
  execute: async ({ category, topN, sortBy, sortOrder }) => {
    const data = await loadRetailData();
    if (!data) return { error: 'Failed to load data' };

    let sales = data.sales;
    if (category) {
      sales = sales.filter((s: any) => 
        s.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Aggregate by product
    const productMetrics = sales.reduce((acc: any, s: any) => {
      if (!acc[s.product]) {
        acc[s.product] = {
          product: s.product,
          category: s.category,
          quantity: 0,
          revenue: 0,
          transactions: 0,
        };
      }
      acc[s.product].quantity += s.quantity;
      acc[s.product].revenue += s.total;
      acc[s.product].transactions += 1;
      return acc;
    }, {});

    // Add profit information
    const productsArray = Object.values(productMetrics).map((p: any) => {
      const inventoryItem = data.inventory.find((i: any) => i.product === p.product);
      const cost = inventoryItem ? inventoryItem.cost : 0;
      const avgPrice = p.revenue / p.quantity;
      const profit = (avgPrice - cost) * p.quantity;
      const profitMargin = cost > 0 ? ((avgPrice - cost) / avgPrice) * 100 : 0;

      return {
        ...p,
        avgPrice: parseFloat(avgPrice.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(1)),
      };
    });

    // Sort by specified criteria
    const sortedProducts = productsArray.sort((a: any, b: any) => {
      let comparison = 0;
      switch (sortBy) {
        case 'revenue':
          comparison = b.revenue - a.revenue;
          break;
        case 'quantity':
          comparison = b.quantity - a.quantity;
          break;
        case 'profit':
          comparison = b.profit - a.profit;
          break;
        case 'profitMargin':
          comparison = b.profitMargin - a.profitMargin;
          break;
        default:
          comparison = b.revenue - a.revenue;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    const topProducts = sortedProducts.slice(0, topN);

    // Category performance
    const categoryPerformance = productsArray.reduce((acc: any, p: any) => {
      if (!acc[p.category]) {
        acc[p.category] = { revenue: 0, quantity: 0 };
      }
      acc[p.category].revenue += p.revenue;
      acc[p.category].quantity += p.quantity;
      return acc;
    }, {});

    return {
      topProducts,
      categoryPerformance: Object.entries(categoryPerformance).map(([cat, data]: [string, any]) => ({
        category: cat,
        revenue: data.revenue,
        quantity: data.quantity,
      })),
      summary: {
        totalProducts: productsArray.length,
        totalRevenue: productsArray.reduce((sum: number, p: any) => sum + p.revenue, 0),
        bestSeller: sortOrder === 'asc' && sortBy === 'quantity' ? 
          `${topProducts[0]?.product} (least sold)` : 
          sortOrder === 'asc' && sortBy === 'revenue' ?
          `${topProducts[0]?.product} (lowest revenue)` :
          topProducts[0]?.product,
        highestMargin: productsArray.sort((a: any, b: any) => 
          parseFloat(b.profitMargin) - parseFloat(a.profitMargin)
        )[0],
      },
      metadata: {
        sortBy,
        sortOrder,
        isLowestFirst: sortOrder === 'asc'
      }
    };
  },
});