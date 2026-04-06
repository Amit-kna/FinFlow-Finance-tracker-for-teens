"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth", "/onboarding", "/upgrade"];

  useEffect(() => {
    if (loading) return;

    // If user is not logged in and trying to access a protected route
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/");
    }
  }, [user, loading, router, pathname]);

  // If user is logged in, show the content
  if (user) {
    return <>{children}</>;
  }

  // If user is not logged in but on a public route, show content
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Otherwise (protected route without auth), return null (redirect will happen in useEffect)
  return null;
}
