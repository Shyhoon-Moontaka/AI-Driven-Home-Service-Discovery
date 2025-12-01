import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { withAuth } from "@/middleware/auth";

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const { bookingId, rating, comment } = await request.json();

    // Validation
    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: "Booking ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user?.toString() !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review completed bookings" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      booking: bookingId,
      user: user.userId,
    });
    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this booking" },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      user: user.userId,
      service: booking.service,
      provider: booking.provider,
      booking: bookingId,
      rating,
      comment,
    });

    // Update service rating
    await updateServiceRating(booking.service.toString());

    return NextResponse.json(
      {
        message: "Review created successfully",
        review: {
          id: review._id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

async function updateServiceRating(serviceId: string) {
  const reviews = await Review.find({ service: serviceId });

  if (reviews.length > 0) {
    const avgRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await Service.findByIdAndUpdate(serviceId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
    });
  }
}
