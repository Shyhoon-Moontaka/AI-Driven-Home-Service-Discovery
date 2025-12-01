import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export function withAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, user);
  };
}

export function withRole(roles: string[]) {
  return (
    handler: (request: NextRequest, user: any) => Promise<NextResponse>
  ) => {
    return withAuth(async (request: NextRequest, user: any) => {
      if (!roles.includes(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return handler(request, user);
    });
  };
}
