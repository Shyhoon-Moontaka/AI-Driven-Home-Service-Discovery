import { GET as AdminPaymentsGET, POST as AdminPaymentsPOST } from '@/app/api/admin/payments/route';
import { createMockRequest, createMockResponse, createMockBooking, createMockUser, createMockPayment } from './test-utils';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

jest.mock('@/lib/prisma');
jest.mock('@/lib/auth');

describe('Admin Payments API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/payments', () => {
    it('should return payments for admin', async () => {
      const mockBooking = createMockBooking({ paymentStatus: 'paid' });
      const mockBookings = [mockBooking];
      
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);
      (prisma.booking.count as jest.Mock).mockResolvedValue(1);
      (prisma.booking.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalPrice: 100 },
        _count: { id: 1 }
      });
      (prisma.booking.groupBy as jest.Mock).mockResolvedValue([
        { paymentStatus: 'paid', _count: { id: 1 }, _sum: { totalPrice: 100 } }
      ]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { month: new Date(), count: 1, revenue: 100 }
      ]);

      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'GET',
        url: '/api/admin/payments?page=1&limit=10'
      });

      const result = await AdminPaymentsGET(request);

      expect(getUserFromRequest).toHaveBeenCalledWith(request);
      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          paymentStatus: { not: 'pending' }
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result.json).toHaveBeenCalledWith({
        payments: expect.arrayContaining([
          expect.objectContaining({
            id: 'booking123',
            paymentStatus: 'paid',
          }),
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
        stats: expect.objectContaining({
          totalRevenue: 100,
          totalTransactions: 1,
          statusDistribution: expect.any(Array),
          monthlyRevenue: expect.any(Array),
        }),
        filters: {
          statuses: ['paid', 'refunded'],
        },
      });
    });

    it('should filter payments by status', async () => {
      const mockBookings = [createMockBooking({ paymentStatus: 'refunded' })];
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);
      (prisma.booking.count as jest.Mock).mockResolvedValue(1);
      (prisma.booking.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalPrice: 0 },
        _count: { id: 0 }
      });
      (prisma.booking.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'GET',
        url: '/api/admin/payments?status=refunded'
      });

      const result = await AdminPaymentsGET(request);

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          paymentStatus: 'refunded',
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should search payments by service name or user', async () => {
      const mockBookings = [createMockBooking({ paymentStatus: 'paid' })];
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);
      (prisma.booking.count as jest.Mock).mockResolvedValue(1);
      (prisma.booking.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalPrice: 100 },
        _count: { id: 1 }
      });
      (prisma.booking.groupBy as jest.Mock).mockResolvedValue([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'GET',
        url: '/api/admin/payments?search=Test'
      });

      const result = await AdminPaymentsGET(request);

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          paymentStatus: { not: 'pending' },
          OR: [
            { service: { name: { contains: 'Test', mode: 'insensitive' } } },
            { user: { name: { contains: 'Test', mode: 'insensitive' } } },
            { user: { email: { contains: 'Test', mode: 'insensitive' } } },
          ],
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should return 401 for non-admin user', async () => {
      // Mock non-admin user
      const mockUser = { userId: '123', email: 'test@example.com', role: 'user' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockUser);

      const request = createMockRequest({
        method: 'GET',
        url: '/api/admin/payments'
      });

      const result = await AdminPaymentsGET(request);

      expect(result.status).toHaveBeenCalledWith(401);
      expect(result.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle server errors gracefully', async () => {
      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      // Mock server error
      (prisma.booking.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        method: 'GET',
        url: '/api/admin/payments'
      });

      const result = await AdminPaymentsGET(request);

      expect(result.status).toHaveBeenCalledWith(500);
      expect(result.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('POST /api/admin/payments', () => {
    it('should process refund successfully', async () => {
      const mockBooking = createMockBooking({ 
        id: 'booking123', 
        paymentStatus: 'paid',
        stripePaymentId: 'pi_test123'
      });
      
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'refunded'
      });

      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'refund',
          bookingId: 'booking123',
          amount: 100
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(getUserFromRequest).toHaveBeenCalledWith(request);
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking123' },
        include: {
          user: true,
          service: true,
        },
      });

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking123' },
        data: {
          paymentStatus: 'refunded',
          updatedAt: expect.any(Date),
        },
        include: expect.any(Object),
      });

      expect(result.json).toHaveBeenCalledWith({
        booking: expect.objectContaining({
          id: 'booking123',
          paymentStatus: 'refunded',
        }),
        message: 'Refund processed successfully',
      });
    });

    it('should mark booking as paid', async () => {
      const mockBooking = createMockBooking({ 
        id: 'booking123', 
        paymentStatus: 'pending'
      });
      
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        paymentStatus: 'paid'
      });

      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'mark_paid',
          bookingId: 'booking123'
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking123' },
        data: {
          paymentStatus: 'paid',
          updatedAt: expect.any(Date),
        },
        include: expect.any(Object),
      });

      expect(result.json).toHaveBeenCalledWith({
        booking: expect.objectContaining({
          id: 'booking123',
          paymentStatus: 'paid',
        }),
        message: 'Payment marked as paid',
      });
    });

    it('should return 400 for missing action or bookingId', async () => {
      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'refund'
          // Missing bookingId
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(result.status).toHaveBeenCalledWith(400);
      expect(result.json).toHaveBeenCalledWith({
        error: 'Action and booking ID are required'
      });
    });

    it('should return 404 for non-existent booking', async () => {
      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      // Mock booking not found
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'refund',
          bookingId: 'nonexistent'
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(result.status).toHaveBeenCalledWith(404);
      expect(result.json).toHaveBeenCalledWith({
        error: 'Booking not found'
      });
    });

    it('should return 400 for refunding unpaid booking', async () => {
      const mockBooking = createMockBooking({ 
        id: 'booking123', 
        paymentStatus: 'pending'
      });
      
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'refund',
          bookingId: 'booking123'
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(result.status).toHaveBeenCalledWith(400);
      expect(result.json).toHaveBeenCalledWith({
        error: 'Cannot refund unpaid booking'
      });
    });

    it('should return 400 for marking already paid booking', async () => {
      const mockBooking = createMockBooking({ 
        id: 'booking123', 
        paymentStatus: 'paid'
      });
      
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'mark_paid',
          bookingId: 'booking123'
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(result.status).toHaveBeenCalledWith(400);
      expect(result.json).toHaveBeenCalledWith({
        error: 'Booking already paid'
      });
    });

    it('should return 400 for invalid action', async () => {
      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'invalid_action',
          bookingId: 'booking123'
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(result.status).toHaveBeenCalledWith(400);
      expect(result.json).toHaveBeenCalledWith({
        error: 'Invalid action'
      });
    });

    it('should return 401 for non-admin user', async () => {
      // Mock non-admin user
      const mockUser = { userId: '123', email: 'test@example.com', role: 'user' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockUser);

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'refund',
          bookingId: 'booking123'
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(result.status).toHaveBeenCalledWith(401);
      expect(result.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should handle server errors gracefully', async () => {
      // Mock admin user
      const mockAdminUser = { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
      (getUserFromRequest as jest.Mock).mockReturnValue(mockAdminUser);

      // Mock server error
      (prisma.booking.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        method: 'POST',
        body: {
          action: 'refund',
          bookingId: 'booking123'
        }
      });

      const result = await AdminPaymentsPOST(request);

      expect(result.status).toHaveBeenCalledWith(500);
      expect(result.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});