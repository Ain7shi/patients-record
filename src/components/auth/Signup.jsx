"use client";

import React from "react";
import client from "@/api/client";
import { useRouter } from "next/navigation";


const Signup = () => {
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();

        const name = e.target[0]?.value;
        const email = e.target[1]?.value;
        const type = e.target[2]?.value;         
        const birthdate = e.target[3]?.value;
        const employeeId = e.target[4]?.value;
        const password = e.target[5]?.value;

        if (!name || !email || !type || !birthdate || !employeeId || !password) {
            toast.error("All fields are required");
            return;
        }

        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    type,         
                    birthdate,
                    employeeId,
                },
            },
        });

        if (error) {
            console.error(error);
            toast.error(error.message);
            return;
        }

        router.push("/"); 
    };

    const inputClass =
        "w-64 bg-gray-100 p-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";

    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-white">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <form onSubmit={handleSignup}>
                    <div className="bg-white rounded-2xl shadow-2xl flex flex-row login">
                        <div className="w-100 p-5">
                            <div className="text-left font-bold">
                                <span className="text-red-500">Group</span>3
                            </div>
                            <div className="items-center justify-items-center py-10">
                                <h2 className="text-2xl font-bold mb-2">Sign up</h2>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <label className="employeeName w-64 text-sm font-medium">
                                    Employee Name
                                    <br />
                                    <span className="text-gray-500">
                                        (First Name Middle Name Last Name)
                                    </span>
                                </label>
                                <input type="text" placeholder="Employee Name" className={inputClass} />

                                <label className="w-64 text-sm font-medium">Email</label>
                                <input type="email" placeholder="Email" className={inputClass} />

                                <label className="employeeType w-64 text-sm font-medium">
                                    Employee Type
                                </label>
                                <select className={inputClass}>
                                    <option value="">Select employee type</option>
                                    <option value="admin">Admin</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="doctor">Doctor</option>
                                </select>

                                <label className="employeeBirthdate w-64 text-sm font-medium">
                                    Employee Birthdate
                                </label>
                                <input type="date" className={inputClass} />

                                <label className="employeeID w-64 text-sm font-medium">
                                    Employee ID
                                </label>
                                <input type="text" placeholder="Employee ID" className={inputClass} />

                                <label className="password w-64 text-sm font-medium">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className={inputClass}
                                />

                                <button
                                    type="submit"
                                    className="mt-4 w-64 border-2 border-red-500 text-red-500 rounded-full px-6 py-2 font-semibold hover:bg-red-500 hover:text-white transition"
                                >
                                    Sign up
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Signup;
