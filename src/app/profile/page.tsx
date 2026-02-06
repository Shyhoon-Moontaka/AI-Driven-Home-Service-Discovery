"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileComponent from "@/components/ProfileComponent";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  // Render the unified profile component
  return <ProfileComponent user={user} />;
};

export default ProfilePage;
