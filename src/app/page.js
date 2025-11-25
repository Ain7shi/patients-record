// "use client";

// import useAuth from "@/hooks/useAuth";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import Auth from "@/components/auth/Auth";

// export default function Home() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   // ✅ only redirect AFTER render
//   useEffect(() => {
//     if (!loading && user) {
//       router.push("/dashboard");
//     }
//   }, [user, loading, router]);

//   if (loading) {
//     return <h1>Loading...</h1>;
//   }

//   // Only show auth if user is NOT logged in
//   return (
//     <div>
//       {!user ? <Auth /> : null}
//     </div>
//   );
// }

"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Auth from "@/components/auth/Auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const role = user.user_metadata?.type;

      if (role === "admin") {
        router.push("/admin");
      } else if (role === "doctor") {
        router.push("/dashboard");
      } else if (role === "nurse") {
        router.push("/nurse");
      } else {
        router.push("/dashboard"); // fallback
      }
    }
  }, [user, loading, router]);

  if (loading) return <h1>Loading...</h1>;

  return (
    <div>
      {!user ? <Auth /> : null}
    </div>
  );
}

