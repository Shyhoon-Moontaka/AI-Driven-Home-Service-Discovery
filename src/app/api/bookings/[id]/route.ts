import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import Service from "@/models/Service";
import { withAuth } from "@/middleware/auth";

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    const booking = await Booking.findById(id)
      .populate("service", "name description price duration location")
      .populate("user", "name email phone address")
      .populate("provider", "name email phone address");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user has permission to view this booking
    // Allow access if user is the customer, provider, or admin
    const bookingUserId =
      booking.user?._id?.toString() || booking.user?.toString();
    const bookingProviderId =
      booking.provider?._id?.toString() || booking.provider?.toString();

    const isCustomer = bookingUserId === user.userId;
    const isProvider = bookingProviderId === user.userId;
    const isAdmin = user.role === "admin";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if review exists
    const review = await Review.findOne({ booking: id, user: user.userId });

    return NextResponse.json({
      booking: {
        id: booking._id,
        date: booking.date,
        status: booking.status,
        notes: booking.notes,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        service: {
          id: booking.service._id,
          name: booking.service.name,
          description: booking.service.description,
          price: booking.service.price,
          duration: booking.service.duration,
          location: booking.service.location,
        },
        user: {
          id: booking.user._id,
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone,
          address: booking.user.address,
        },
        provider: {
          id: booking.provider._id,
          name: booking.provider.name,
          email: booking.provider.email,
          phone: booking.provider.phone,
          address: booking.provider.address,
        },
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
      canReview: booking.status === "completed" && !review,
    });
  } catch (error) {
    console.error("Booking details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { status, notes } = await request.json();

    // Authorization checks
    if (user.role === "user" && booking.user.toString() !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (
      user.role === "provider" &&
      booking.provider.toString() !== user.userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Status transition validation
    const allowedStatuses: { [key: string]: string[] } = {
      user: ["cancelled"],
      provider: ["confirmed", "in_progress", "completed", "cancelled"],
      admin: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
    };

    if (status && !allowedStatuses[user.role]?.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json({
      message: "Booking updated successfully",
      booking: {
        id: updatedBooking!._id,
        status: updatedBooking!.status,
        notes: updatedBooking!.notes,
      },
    });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only allow cancellation, not deletion
    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot cancel completed or already cancelled booking" },
        { status: 400 }
      );
    }

    // Check permissions
    if (
      booking.user.toString() !== user.userId &&
      booking.provider.toString() !== user.userId &&
      user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Booking.findByIdAndUpdate(id, { status: "cancelled" });

    return NextResponse.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
