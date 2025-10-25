import React from "react";
import client from "@/api/client";

const Login = () => {
    const handleSignin = async (e) => {
        e.preventDefault();
        const email = e.target[0]?.value;
        const password = e.target[1]?.value;
        // console.log(name, type, birthdate, id, pass);

        if(!email||!password){
            toast.error('All fields are required')
            return
        }

        const {data, error} = await client.auth.signInWithPassword({
            email,
            password,
        });
        console.log(data);
        console.log(error);

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