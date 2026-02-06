import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where: any = {
      paymentStatus: { not: 'pending' }, // Only show completed payments
    };

    if (search) {
      where.OR = [
        { service: { name: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) {
      where.paymentStatus = status;
    }

    const [payments, total, revenueStats] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              price: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
      // Get revenue statistics
      prisma.booking.aggregate({
        where: {
          paymentStatus: 'paid',
        },
        _sum: {
          totalPrice: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Get payment status distribution
    const statusDistribution = await prisma.booking.groupBy({
      by: ['paymentStatus'],
      where: {
        paymentStatus: { not: 'pending' },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Serialize status distribution to handle BigInt values
    const serializedStatusDistribution = statusDistribution.map((item: any) => ({
      paymentStatus: item.paymentStatus,
      count: Number(item._count.id) || 0,
      totalRevenue: Number(item._sum.totalPrice) || 0,
    }));

    // Get monthly revenue data (last 12 months)
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        SUM("totalPrice") as revenue
      FROM "bookings" 
      WHERE "paymentStatus" = 'paid' 
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    // Convert BigInt values to regular numbers for JSON serialization
    const serializedMonthlyRevenue = (monthlyRevenue as any[]).map((item) => ({
      month: item.month ? new Date(item.month).toISOString() : null,
      count: Number(item.count) || 0,
      revenue: Number(item.revenue) || 0,
    }));

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalRevenue: revenueStats._sum.totalPrice || 0,
        totalTransactions: revenueStats._count.id || 0,
        statusDistribution: serializedStatusDistribution,
        monthlyRevenue: serializedMonthlyRevenue,
      },
      filters: {
        statuses: ['paid', 'refunded'],
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, bookingId, amount } = await request.json();

    if (!action || !bookingId) {
      return NextResponse.json({ error: 'Action and booking ID are required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    switch (action) {
      case 'refund':
        if (booking.paymentStatus !== 'paid') {
          return NextResponse.json({ error: 'Cannot refund unpaid booking' }, { status: 400 });
        }

        // Process refund through Stripe (if stripePaymentId exists)
        let refundResult = null;
        const anyBooking = booking as any;
        if (anyBooking.stripePaymentId && stripe) {
          try {
            refundResult = await stripe.refunds.create({
              payment_intent: anyBooking.stripePaymentId,
              amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
            });
          } catch (stripeError: any) {
            console.error('Stripe refund error:', stripeError);
            return NextResponse.json(
              { error: 'Refund processing failed: ' + stripeError.message },
              { status: 400 }
            );
          }
        }

        // Update booking status
        const updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'refunded',
            updatedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                price: true,
              },
            },
          },
        });

        return NextResponse.json({
          booking: updatedBooking,
          refund: refundResult,
          message: 'Refund processed successfully',
        });

      case 'mark_paid':
        if (booking.paymentStatus === 'paid') {
          return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
        }

        const paidBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'paid',
            updatedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                price: true,
              },
            },
          },
        });

        return NextResponse.json({
          booking: paidBooking,
          message: 'Payment marked as paid',
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing payment action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}