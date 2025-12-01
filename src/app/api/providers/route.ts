import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Service from "@/models/Service";
import Review from "@/models/Review";
import { withAuth, withRole } from "@/middleware/auth";
import { hashPassword } from "@/lib/auth";

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get all providers
    const providers = await User.find({ role: "provider" })
      .select("name email phone address createdAt")
      .skip((page - 1) * limit)
      .limit(limit);

    // Get provider stats
    const providerStats = await Promise.all(
      providers.map(async (provider) => {
        const services = await Service.find({ provider: provider._id });
        const totalBookings = await Service.aggregate([
          { $match: { provider: provider._id } },
          {
            $lookup: {
              from: "bookings",
              localField: "_id",
              foreignField: "service",
              as: "bookings",
            },
          },
          { $unwind: "$bookings" },
          { $count: "total" },
        ]);

        const avgRating = await Review.aggregate([
          {
            $lookup: {
              from: "services",
              localField: "service",
              foreignField: "_id",
              as: "service",
            },
          },
          { $unwind: "$service" },
          { $match: { "service.provider": provider._id } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
              count: { $sum: 1 },
            },
          },
        ]);

        return {
          id: provider._id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          address: provider.address,
          servicesCount: services.length,
          totalBookings: totalBookings[0]?.total || 0,
          avgRating: avgRating[0]?.avgRating || 0,
          reviewCount: avgRating[0]?.count || 0,
          createdAt: provider.createdAt,
        };
      })
    );

    const total = await User.countDocuments({ role: "provider" });

    return NextResponse.json({
      providers: providerStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Providers list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const POST = withRole(["admin"])(
  async (request: NextRequest, user: any) => {
    try {
      await dbConnect();

      const { name, email, password, phone, address } = await request.json();

      // Validation
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "Name, email, and password are required" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      // Create provider
      const provider = await User.create({
        name,
        email,
        password: hashPassword(password),
        phone,
        address,
        role: "provider",
      });

      return NextResponse.json(
        {
          message: "Provider created successfully",
          provider: {
            id: provider._id,
            name: provider.name,
            email: provider.email,
            phone: provider.phone,
            address: provider.address,
            role: provider.role,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Provider creation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
