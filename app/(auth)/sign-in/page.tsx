"use client";

import { useAuth } from "@/providers/AuthProvider";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  const { user, loading } = useAuth();

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
  //     </div>
  //   );
  // }

  if (user) {
    window.location.href = "/chat";
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  );
}
