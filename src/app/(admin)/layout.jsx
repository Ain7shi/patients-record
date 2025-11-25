// "use client";

// import React, { useEffect } from 'react'
// import { useRouter } from "next/navigation";
// import useAuth from '@/hooks/useAuth';

// const PrivatePagesLayout = ({ children }) => {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push("/");
//     }
//   }, [user, loading]);

//   if (loading || !user) return null;

//   return (
//     <div className="min-h-screen">
//       {children}   {/* ✅ render dashboard pages here */}
//     </div>
//   );
// };

// export default PrivatePagesLayout;

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } 
      else if (user.user_metadata.type !== "admin") {
        router.push("/dashboard");   // ❗ block doctors/nurses
      }
    }
  }, [user, loading]);

  if (loading || !user) return null;

  return <>{children}</>;
}

