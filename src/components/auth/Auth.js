"use client"

import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

const Auth = () => {
    const [showLogin, setShowLogin] = useState(true);

    return(
        <div>
            <div>
                {/* <button onClick={() => setShowLogin(true)}>Login</button><button onClick={() => setShowLogin(false)}>Sign Up</button> */}
                <Login />
            </div>
            {/* <div>
                {showLogin ? <Login />: <Signup />}
            </div> */}
        
        </div>
    );
};

export default Auth;
