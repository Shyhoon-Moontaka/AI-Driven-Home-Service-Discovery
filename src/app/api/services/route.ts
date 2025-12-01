import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import User from "@/models/User";
import { withAuth, withRole } from "@/middleware/auth";
import { recommendServices } from "@/lib/ai";

export const GET = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filter: any = { isActive: true };

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };

    let services;
    let total;

    if (query) {
      // AI-powered search
      const allServices = await Service.find(filter)
        .populate("provider", "name email phone")
        .sort({ rating: -1, reviewCount: -1 });

      const descriptions = allServices.map(
        (s) => `${s.name} ${s.description} ${s.tags.join(" ")}`
      );
      const similarities = await recommendServices(query, descriptions);

      // Sort by similarity and paginate
      const sortedServices = allServices
        .map((service, index) => ({ service, similarity: similarities[index] }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice((page - 1) * limit, page * limit);

      services = sortedServices.map((item) => item.service);
      total = allServices.length;
    } else {
      services = await Service.find(filter)
        .populate("provider", "name email phone")
        .sort({ rating: -1, reviewCount: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      total = await Service.countDocuments(filter);
    }

    return NextResponse.json({
      services: services.map((service) => ({
        id: service._id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        location: service.location,
        availability: service.availability,
        tags: service.tags,
        rating: service.rating,
        reviewCount: service.reviewCount,
        provider: service.provider
          ? {
              id: service.provider._id,
              name: service.provider.name,
              email: service.provider.email,
              phone: service.provider.phone,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Services list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withRole(["provider"])(
  async (request: NextRequest, user: any) => {
    try {
      await dbConnect();

      const {
        name,
        description,
        category,
        price,
        duration,
        location,
        availability,
        tags,
      } = await request.json();

      // Validation
      if (
        !name ||
        !description ||
        !category ||
        !price ||
        !duration ||
        !location
      ) {
        return NextResponse.json(
          { error: "All required fields must be provided" },
          { status: 400 }
        );
      }

      const service = await Service.create({
        name,
        description,
        category,
        price,
        duration,
        location,
        availability,
        tags: tags || [],
        provider: user.userId,
      });

      return NextResponse.json(
        {
          message: "Service created successfully",
          service: {
            id: service._id,
            name: service.name,
            description: service.description,
            category: service.category,
            price: service.price,
            duration: service.duration,
            location: service.location,
            availability: service.availability,
            tags: service.tags,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Service creation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
