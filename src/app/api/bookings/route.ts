import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { withAuth } from "@/middleware/auth";

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filter: any = {};

    if (user.role === "user") {
      filter.user = user.userId;
    } else if (user.role === "provider") {
      filter.provider = user.userId;
    }

    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("service", "name description price duration")
      .populate("user", "name email phone")
      .populate("provider", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    return NextResponse.json({
      bookings: bookings.map((booking) => ({
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
        },
        user:
          user.role === "provider"
            ? {
                id: booking.user._id,
                name: booking.user.name,
                email: booking.user.email,
                phone: booking.user.phone,
              }
            : undefined,
        provider:
          user.role === "user"
            ? {
                id: booking.provider._id,
                name: booking.provider.name,
                email: booking.provider.email,
                phone: booking.provider.phone,
              }
            : undefined,
        createdAt: booking.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Bookings list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const { serviceId, date, notes } = await request.json();

    // Validation
    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "Service ID and date are required" },
        { status: 400 }
      );
    }

    // Check if service exists and is active
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Service not found or unavailable" },
        { status: 404 }
      );
    }

    // Check if service has a provider
    if (!service.provider) {
      return NextResponse.json(
        { error: "Service is not available" },
        { status: 400 }
      );
    }

    // Check if user is not booking their own service
    if (service.provider.toString() === user.userId) {
      return NextResponse.json(
        { error: "Cannot book your own service" },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      service: serviceId,
      date: new Date(date),
      status: { $in: ["pending", "confirmed", "in_progress"] },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Service is not available at this time" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      user: user.userId,
      service: serviceId,
      provider: service.provider,
      date: new Date(date),
      notes,
      totalPrice: service.price,
    });

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: {
          id: booking._id,
          date: booking.date,
          status: booking.status,
          totalPrice: booking.totalPrice,
          service: {
            id: service._id,
            name: service.name,
            description: service.description,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
