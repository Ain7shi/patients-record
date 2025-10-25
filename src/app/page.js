"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Auth from "@/components/auth/Auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ✅ only redirect AFTER render
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  // Only show auth if user is NOT logged in
  return (
    <div>
      {!user ? <Auth /> : null}
    </div>
  );
}
