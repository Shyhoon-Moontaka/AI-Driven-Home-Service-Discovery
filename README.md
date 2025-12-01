# E-Commerce Service Platform

A comprehensive full-stack service marketplace built with Next.js, React, and MongoDB. Connects customers with service providers for home repairs, cleaning, tutoring, fitness training, and various other services. Features AI-powered recommendations, real-time booking management, review systems, and role-based dashboards.

## 🚀 Live Demo

[View the application](https://your-deployed-url.com) _(Replace with your actual deployment URL)_

## ✨ Features

### 🎯 Core Functionality

- **Service Discovery**: Browse and search services by category, location, and price
- **AI-Powered Recommendations**: Intelligent service matching using natural language processing
- **Real-time Booking System**: Instant booking with conflict detection and status tracking
- **Multi-role Platform**: Support for customers, service providers, and administrators
- **Review & Rating System**: 5-star rating system with detailed customer reviews
- **Advanced Search & Filtering**: Filter by category, location, price, and AI-powered search
- **Role-based Dashboards**: Separate interfaces for customers, providers, and admins

### 👥 User Roles & Features

- **Customers**:

  - Browse and search services
  - Book appointments with real-time availability
  - Leave reviews and ratings for completed services
  - Manage personal booking history
  - Receive AI-powered service recommendations

- **Service Providers**:

  - Create and manage service listings
  - Set pricing, availability, and service details
  - Handle booking requests and status updates
  - View customer reviews and ratings
  - Track business performance

- **Administrators**:
  - Platform oversight and user management
  - Service moderation and quality control
  - System monitoring and analytics
  - User role management

### 🔧 Technical Features

- **JWT Authentication**: Secure stateless authentication with role-based access control
- **MongoDB Integration**: Robust NoSQL database with Mongoose ODM and data relationships
- **RESTful API**: Well-structured endpoints with proper HTTP methods and status codes
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and custom components
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Security**: Input validation, authentication middleware, CORS, and security headers
- **AI Integration**: Hugging Face Transformers for natural language processing
- **Real-time Features**: Dynamic booking status updates and conflict detection

## 🛠️ Tech Stack

### Backend

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI/ML**: Hugging Face Transformers
- **Validation**: Zod schemas
- **Security**: bcryptjs, custom security middleware

### Frontend

- **Framework**: Next.js 16 (React)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **UI Components**: Custom components with Tailwind
- **Icons**: Emoji and custom SVG icons

### DevOps & Tools

- **Containerization**: Docker & Docker Compose
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Package Manager**: npm

## 📱 Application Pages

### Public Pages (No Authentication Required)

- **Home** (`/`) - Service discovery with search, filtering, and AI recommendations
- **AI Recommendations** (`/recommendations`) - Dedicated AI-powered service matching page
- **Service Details** (`/services/[id]`) - Individual service pages with booking form and reviews
- **Login** (`/auth/login`) - User authentication with role selection
- **Register** (`/auth/register`) - User registration (customer or service provider)

### Protected Pages (Authentication Required)

- **Customer Dashboard** (`/dashboard/bookings`) - View and manage personal bookings, leave reviews
- **Provider Dashboard** (`/dashboard/provider`) - Create and manage service listings, handle bookings
- **Admin Panel** (`/admin`) - Platform administration, user management, system monitoring
- **Review Page** (`/services/[bookingId]/review`) - Leave reviews for completed services

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Services

- `GET /api/services` - List/search services (with AI recommendations)
- `POST /api/services` - Create service (providers only)
- `GET /api/services/[id]` - Get service details with reviews
- `PUT /api/services/[id]` - Update service (providers only)
- `DELETE /api/services/[id]` - Delete service (providers only)

### Bookings

- `GET /api/bookings` - List user/provider bookings
- `POST /api/bookings` - Create booking with conflict checking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking status
- `DELETE /api/bookings/[id]` - Cancel booking

### Providers

- `GET /api/providers` - List service providers with stats
- `POST /api/providers` - Create provider account (admin only)

### Reviews & Ratings

- `POST /api/reviews` - Create review for completed booking
- Automatic rating calculation and service rating updates

### AI Recommendations

- `GET /api/recommendations` - Get AI-powered service recommendations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd service-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
MONGODB_URI=mongodb://localhost:27017/service-platform
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Start MongoDB**

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using local MongoDB installation
mongod
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**
   Navigate to `http://localhost:3000` to see the application running!

### Building for Production

1. **Build the application**

```bash
npm run build
```

2. **Start the production server**

```bash
npm run start
```

The application will be available at `http://localhost:3000`.

### 🎯 Quick Start Guide

1. **Register as a Customer or Provider**

   - Visit the registration page and choose your role
   - Customers can browse and book services
   - Service providers can create and manage listings

2. **For Service Providers:**

   - Navigate to "My Services" in the dashboard
   - Create detailed service listings with pricing and availability
   - Manage booking requests and update service status
   - View customer reviews and track performance

3. **For Customers:**

   - Browse services on the home page with advanced filtering
   - Use AI-powered recommendations for personalized suggestions
   - Book services directly with real-time availability checking
   - Leave detailed reviews after service completion

4. **Explore Advanced Features:**
   - Try natural language search ("house cleaning near me")
   - Use AI recommendations for discovering new services
   - Manage all bookings and reviews in your personal dashboard
   - Track service provider performance and ratings

## Environment Variables

| Variable              | Description               | Default                 |
| --------------------- | ------------------------- | ----------------------- |
| `MONGODB_URI`         | MongoDB connection string | Required                |
| `JWT_SECRET`          | JWT signing secret        | Required                |
| `NEXT_PUBLIC_API_URL` | API base URL              | `http://localhost:3000` |
| `ALLOWED_ORIGINS`     | CORS allowed origins      | `*`                     |

## 📊 Database Models

### User Model

```typescript
{
  name: string;
  email: string;
  password: string; // hashed
  phone?: string;
  address?: string;
  role: "user" | "provider" | "admin";
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Service Model

```typescript
{
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in minutes
  provider: ObjectId;
  location: string;
  availability: {
    days: string[]; // ['monday', 'tuesday', etc.]
    startTime: string; // '09:00'
    endTime: string; // '17:00'
  };
  tags: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
}
```

### Booking Model

```typescript
{
  user: ObjectId;
  service: ObjectId;
  provider: ObjectId;
  date: Date;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "refunded";
}
```

### Review Model

```typescript
{
  user: ObjectId;
  service: ObjectId;
  provider: ObjectId;
  booking: ObjectId;
  rating: number; // 1-5
  comment?: string;
}
```

## Security Features

- JWT-based stateless authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers
- SQL injection prevention
- XSS protection

## AI Integration

The platform uses Hugging Face Transformers for:

- Natural language processing for service search
- Semantic similarity matching
- Intelligent service recommendations based on user queries

## Deployment

### Production Considerations

1. **Database**: Use MongoDB Atlas or a managed MongoDB service
2. **Environment Variables**: Set production values for all required variables
3. **Rate Limiting**: Implement Redis-based rate limiting for production
4. **Monitoring**: Add logging and monitoring solutions
5. **SSL/TLS**: Ensure HTTPS in production
6. **Backup**: Set up database backups

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## API Documentation

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Response Format

Success responses:

```json
{
  "data": {...},
  "message": "Success message"
}
```

Error responses:

```json
{
  "error": "Error message",
  "details": {...}
}
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Development Guidelines

- Follow TypeScript best practices
- Write clear, concise commit messages
- Test both frontend and backend functionality
- Ensure responsive design works on all devices
- Follow the existing code style and patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Tailwind CSS** - A utility-first CSS framework
- **MongoDB** - NoSQL database for modern applications
- **Hugging Face** - AI/ML models for natural language processing
- **Vercel** - Platform for frontend frameworks and static sites

## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Happy coding! 🎉**
