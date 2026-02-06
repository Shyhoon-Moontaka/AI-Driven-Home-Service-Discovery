import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import redis from "@/lib/redis";

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { latitude, longitude } = await request.json();

    // Validate input
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Latitude and longitude must be numbers" },
        { status: 400 },
      );
    }

    const redisKey = user.userId.toString();

    // Store location in Redis
    await redis.set(redisKey, JSON.stringify({ latitude, longitude }));

    return NextResponse.json({
      message: "Location updated successfully",
      user: {
        id: user.userId,
        latitude,
        longitude,
      },
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetId = request.nextUrl.searchParams.get("targetId"); // get from query
    if (!targetId) {
      return NextResponse.json({ error: "targetId required" }, { status: 400 });
    }

    const redisKey = targetId.toString();
    const locationData = await redis.get(redisKey);

    if (!locationData) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    const { latitude, longitude } = JSON.parse(locationData);
    return NextResponse.json({ latitude, longitude });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 },
    );
  }
}
