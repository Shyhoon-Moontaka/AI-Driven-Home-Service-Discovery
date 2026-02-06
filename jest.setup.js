// Jest setup file
import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Headers(),
    })),
  },
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    service: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    booking: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    review: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    payment: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Mock authentication functions
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn((password) => `hashed_${password}`),
  comparePassword: jest.fn((password, hashed) => password === 'correct_password' || hashed === `hashed_${password}`),
  generateToken: jest.fn((payload) => `token_${payload.userId}_${payload.email}`),
  verifyToken: jest.fn((token) => {
    if (token === 'valid_token') {
      return { userId: '123', email: 'test@example.com', role: 'user' };
    }
    if (token === 'admin_token') {
      return { userId: 'admin123', email: 'admin@example.com', role: 'admin' };
    }
    if (token === 'provider_token') {
      return { userId: 'provider123', email: 'provider@example.com', role: 'provider' };
    }
    return null;
  }),
  getTokenFromRequest: jest.fn(),
  getUserFromRequest: jest.fn(),
}));

// Mock middleware functions
jest.mock('@/middleware/auth', () => ({
  withAuth: jest.fn((handler) => {
    return async (request, user) => {
      // Mock user context for testing
      const mockUser = user || { userId: '123', email: 'test@example.com', role: 'user' };
      return await handler(request, mockUser);
    };
  }),
  withRole: jest.fn((roles) => {
    return (handler) => {
      return async (request, user) => {
        // Mock user context for testing
        const mockUser = user || { userId: 'provider123', email: 'provider@example.com', role: 'provider' };
        return await handler(request, mockUser);
      };
    };
  }),
}));

// Mock AI recommendation
jest.mock('@/lib/ai', () => ({
  recommendServices: jest.fn(() => Promise.resolve([0.9, 0.8, 0.7])),
}));

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn().mockResolvedValue({}),
      confirm: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Setup global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});