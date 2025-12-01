import { z } from "zod";

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["user", "provider"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Service validation schemas
export const createServiceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  duration: z.number().positive("Duration must be positive"),
  location: z.string().min(1, "Location is required"),
  availability: z.object({
    days: z.array(z.string()),
    startTime: z.string(),
    endTime: z.string(),
  }),
  tags: z.array(z.string()).optional(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Booking validation schemas
export const createBookingSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
  status: z
    .enum(["pending", "confirmed", "in_progress", "completed", "cancelled"])
    .optional(),
  notes: z.string().optional(),
});

// Review validation schema
export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
});

// Validation middleware
export function validateRequest(schema: z.ZodSchema) {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        };
      }
      return { success: false, error: "Invalid request data" };
    }
  };
}
