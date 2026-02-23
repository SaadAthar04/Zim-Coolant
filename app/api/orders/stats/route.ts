import { NextRequest, NextResponse } from 'next/server';
import { orderOperations, productOperations } from '@/lib/database';

// GET /api/orders/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get stats
    const totalOrders = orderOperations.count(['confirmed', 'completed'], 'paid');
    const totalSales = orderOperations.getTotalSales();
    const allPaidOrders = orderOperations.getConfirmedAndPaid();
    const productsCount = productOperations.count();

    // Get orders in date range for chart
    const ordersInRange = orderOperations.getOrdersInDateRange(startDate.toISOString());

    // Group orders by date for chart
    const dailyData: { [key: string]: { date: string; sales: number; orders: number } } = {};

    ordersInRange.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      if (!dailyData[date]) {
        dailyData[date] = { date, sales: 0, orders: 0 };
      }

      dailyData[date].sales += order.total_amount;
      dailyData[date].orders += 1;
    });

    const chartData = Object.values(dailyData);

    // Get top products
    const products = productOperations.getAll();
    const topProducts = products.map(product => {
      let totalSales = 0;
      let totalRevenue = 0;

      allPaidOrders.forEach(order => {
        order.items.forEach((item: any) => {
          if (item.product_id === product.id) {
            totalSales += item.quantity || 0;
            totalRevenue += (item.quantity || 0) * (item.price || 0);
          }
        });
      });

      return {
        name: product.name,
        sales: totalSales,
        revenue: totalRevenue,
        stock_quantity: product.stock_quantity || 0
      };
    }).sort((a, b) => b.sales - a.sales).slice(0, 4);

    return NextResponse.json({
      data: {
        stats: {
          totalSales,
          totalOrders,
          totalCustomers: allPaidOrders.length,
          productsCount
        },
        chartData,
        topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
