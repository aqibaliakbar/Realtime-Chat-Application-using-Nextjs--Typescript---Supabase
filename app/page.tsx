"use client";

import { useAuth } from "@/providers/AuthProvider";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (user) {
    window.location.href = "/chat";
    return null;
  } else {
    window.location.href = "/sign-in";
    return null;
  }
}
