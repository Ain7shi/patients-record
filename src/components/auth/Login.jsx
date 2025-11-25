"use client";

import React from "react";
import client from "@/api/client";
import { useRouter } from "next/navigation";

const Login = () => {
    const router = useRouter();

    const handleSignin = async (e) => {
        e.preventDefault();
        console.log("Login submitted");

        const email = e.target.employeeEmail.value;
        const password = e.target.password.value;

        const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
        });

        console.log("Login response:", data);
        console.log("Metadata:", data.user?.user_metadata);

        if (error) {
            console.error("Login error:", error.message);
            alert(error.message);
            return;
        }

        // Check account status
        const status = data.user?.user_metadata?.status;
        console.log("Account status:", status);

        if (status === "Inactive") {
            alert("Your account is inactive. Contact admin.");
            await client.auth.signOut();
            return;
        }

        const role = data.user?.user_metadata?.type;
        console.log("Detected role:", role);

        // Redirect based on role
        if (role === "admin") {
            console.log("Redirecting to /admin");
            router.push("/admin");
            return;
        }

        if (role === "doctor") {
            console.log("Redirecting to /dashboard");
            router.push("/dashboard");
            return;
        }

        if (role === "nurse") {
            console.log("Redirecting to /nurse");
            router.push("/nurse");
            return;
        }

        console.log("No role detected, fallback redirect");
        router.push("/dashboard");
    };

    const inputClass =
    "w-64 bg-gray-100 p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";

    return(
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-white">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <form onSubmit={handleSignin}>    
                <div className="bg-white rounded-2xl shadow-2xl flex flex-row login ">
                    <div className="w-100 p-5">
                        <div className="text-left font-bold">  
                        <span className="text-red-500">Group</span>3
                        </div>  
                        <div className="items-center justify-items-center py-10">
                        <h2 className="text-2xl font-bold mb-2">Sign in</h2>
                        </div>
                        
                        <div className="flex flex-col items-center">
                        <label className="employeeID">Email</label>
                        <div>
                            <input type="text" name="employeeEmail" placeholder="Employee Email" className={inputClass} required></input>
                        </div>
                        <br></br>
                        <label className="password">Password</label>
                        <div>
                            <input type="password" name="password" placeholder="Password" className={inputClass} required></input>
                        </div>
                        <br></br>
                        <button
                        type="submit"
                        className="mt-4 w-64 border-2 border-red-500 text-red-500 rounded-full px-6 py-2 font-semibold hover:bg-red-500 hover:text-white transition"
                        >
                            Sign in
                        </button>
                        </div>
                    </div>
                </div>
            </form>    
        </main>
        
        </div>
    )
}

export default Login;