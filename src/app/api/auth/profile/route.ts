import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { withAuth } from "@/middleware/auth";

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const userDoc = await User.findById(user.userId).select("-password");
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        address: userDoc.address,
        role: userDoc.role,
        isVerified: userDoc.isVerified,
        createdAt: userDoc.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, user: any) => {
  try {
    await dbConnect();

    const { name, phone, address } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { name, phone, address },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
