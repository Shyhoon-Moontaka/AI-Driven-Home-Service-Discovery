import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import Review from "@/models/Review";
import { withAuth, withRole } from "@/middleware/auth";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  try {
    await dbConnect();

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    const service = await Service.findById(id).populate(
      "provider",
      "name email phone address"
    );

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Get reviews for this service
    const reviews = await Review.find({ service: id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
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
        rating: service.rating,
        reviewCount: service.reviewCount,
        provider: service.provider
          ? {
              id: service.provider._id,
              name: service.provider.name,
              email: service.provider.email,
              phone: service.provider.phone,
              address: service.provider.address,
            }
          : null,
      },
      reviews: reviews.map((review) => ({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        user: {
          name: review.user.name,
        },
        createdAt: review.createdAt,
      })),
    });
  } catch (error) {
    console.error("Service details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const PUT = withRole(["provider"])(
  async (request: NextRequest, user: any) => {
    try {
      await dbConnect();

      const { pathname } = new URL(request.url);
      const id = pathname.split("/").pop();

      const service = await Service.findOne({ _id: id, provider: user.userId });
      if (!service) {
        return NextResponse.json(
          { error: "Service not found or unauthorized" },
          { status: 404 }
        );
      }

      const {
        name,
        description,
        category,
        price,
        duration,
        location,
        availability,
        tags,
        isActive,
      } = await request.json();

      const updatedService = await Service.findByIdAndUpdate(
        id,
        {
          name,
          description,
          category,
          price,
          duration,
          location,
          availability,
          tags,
          isActive,
        },
        { new: true }
      );

      return NextResponse.json({
        message: "Service updated successfully",
        service: {
          id: updatedService!._id,
          name: updatedService!.name,
          description: updatedService!.description,
          category: updatedService!.category,
          price: updatedService!.price,
          duration: updatedService!.duration,
          location: updatedService!.location,
          availability: updatedService!.availability,
          tags: updatedService!.tags,
          isActive: updatedService!.isActive,
        },
      });
    } catch (error) {
      console.error("Service update error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withRole(["provider"])(
  async (request: NextRequest, user: any) => {
    try {
      await dbConnect();

      const { pathname } = new URL(request.url);
      const id = pathname.split("/").pop();

      const service = await Service.findOneAndDelete({
        _id: id,
        provider: user.userId,
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found or unauthorized" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Service deletion error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
